from typing import TypedDict

from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph

from app.config import settings
from app.schemas import CapaPlan, DeviationDetails, RcaAnalysisResult, RootCauseAnalysis

SYSTEM_PROMPT = (
    "You are a senior Quality Assurance investigator at an Active Pharmaceutical Ingredient (API) "
    "manufacturing plant working under ICH Q7 / GMP. Base every statement ONLY on the incident text. "
    "Never invent batch numbers, dates, readings or names - write 'Not provided' instead. "
    "Your output is a PRELIMINARY suggestion that a human QA reviewer must verify."
)


class RcaState(TypedDict, total=False):
    incident_text: str
    method: str
    deviation: DeviationDetails
    analysis: RootCauseAnalysis
    capa: CapaPlan


def ask_llm(schema, instructions: str):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_key_here":
        raise RuntimeError("GROQ_API_KEY is not set. Add your key to backend/.env and restart the API.")

    llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, temperature=0)
    structured_llm = llm.with_structured_output(schema)
    messages = [("system", SYSTEM_PROMPT), ("human", instructions)]

    try:
        return structured_llm.invoke(messages)
    except Exception as first_error:
        print(f"[rca_graph] {schema.__name__}: first attempt failed, retrying once ({first_error.__class__.__name__})")
        return structured_llm.invoke(messages)


def extract_deviation(state: RcaState) -> dict:
    deviation = ask_llm(
        DeviationDetails,
        "Extract the deviation details from this report. Severity: Critical = risk to patient "
        "safety or batch rejection likely, Major = GMP impact needing investigation, Minor = low impact.\n\n"
        f"REPORT:\n{state['incident_text']}",
    )
    return {"deviation": deviation}


def analyze_root_cause(state: RcaState) -> dict:
    analysis = ask_llm(
        RootCauseAnalysis,
        f"Perform a root cause analysis. Primary methodology: {state['method']} "
        f"(set investigation_method to exactly '{state['method']}'), but fill BOTH the 5 Whys chain "
        "and all 6 Fishbone categories. Every root cause must quote supporting evidence from the report. "
        "Set is_verified to false for every cause. List the missing evidence QA must still collect "
        "(e.g. calibration certificates, batch manufacturing records, operator interviews, logbooks).\n\n"
        f"DEVIATION SUMMARY:\n{state['deviation'].model_dump_json(indent=2)}\n\n"
        f"FULL REPORT:\n{state['incident_text']}",
    )
    analysis.investigation_method = state["method"]
    for cause in analysis.potential_root_causes:
        cause.is_verified = False
    return {"analysis": analysis}


def generate_capa(state: RcaState) -> dict:
    capa = ask_llm(
        CapaPlan,
        "Propose a CAPA plan. Include at least one Corrective action (fix this batch / equipment now) "
        "and at least one Preventive action (stop it happening again). Each rationale must name the "
        "root cause it addresses. Use realistic owner departments (Production, QA, QC, Engineering, "
        "Warehouse, Training) and target days.\n\n"
        f"ROOT CAUSE ANALYSIS:\n{state['analysis'].model_dump_json(indent=2)}",
    )
    return {"capa": capa}


def build_rca_graph():
    graph = StateGraph(RcaState)
    graph.add_node("extract_deviation", extract_deviation)
    graph.add_node("analyze_root_cause", analyze_root_cause)
    graph.add_node("generate_capa", generate_capa)

    graph.add_edge(START, "extract_deviation")
    graph.add_edge("extract_deviation", "analyze_root_cause")
    graph.add_edge("analyze_root_cause", "generate_capa")
    graph.add_edge("generate_capa", END)
    return graph.compile()


rca_graph = build_rca_graph()


def run_rca_analysis(incident_text: str, method: str) -> RcaAnalysisResult:
    final_state = rca_graph.invoke({"incident_text": incident_text, "method": method})
    return RcaAnalysisResult(
        **final_state["deviation"].model_dump(),
        **final_state["analysis"].model_dump(),
        **final_state["capa"].model_dump(),
    )
