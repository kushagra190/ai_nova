from datetime import datetime

from pydantic import BaseModel, Field


class FiveWhyStep(BaseModel):
    """One step of the '5 Whys' method: ask 'why?' and record the answer."""
    why_number: int = Field(description="Step number, 1 to 5")
    question: str = Field(description="The 'Why ...?' question for this step")
    answer: str = Field(description="Answer based on the incident details")
    evidence_reference: str = Field(
        description="Record supporting the answer, e.g. batch record, logbook, SOP number"
    )


class FishboneCategory(BaseModel):
    """Ishikawa (Fishbone) diagram: possible causes grouped into the 6 'M' categories.
    Lists default to empty, so the AI may skip a category instead of failing the whole response."""
    manpower: list[str] = Field(default_factory=list, description="People-related causes (training, fatigue, errors)")
    machine_equipment: list[str] = Field(default_factory=list, description="Equipment causes (reactor, dryer, pumps, sensors)")
    material: list[str] = Field(default_factory=list, description="Raw material, solvent, intermediate or reagent causes")
    method_process: list[str] = Field(default_factory=list, description="SOP, process parameter or procedure causes")
    measurement: list[str] = Field(default_factory=list, description="Calibration, sampling or test method causes")
    environment: list[str] = Field(default_factory=list, description="Temperature, humidity, cleanroom or utility causes")


class RootCauseItem(BaseModel):
    """One possible root cause. Stays unverified until QA confirms it."""
    cause: str = Field(description="Short description of the possible root cause")
    category: str = Field(description="One of: Equipment, Process, Human Error, Material, Measurement, Environment")
    confidence: str = Field(description="One of: High, Medium, Low")
    supporting_evidence: str = Field(description="Facts from the incident that support this cause")
    is_verified: bool = Field(default=False, description="Set to true ONLY by a human QA reviewer")


class CapaItem(BaseModel):
    """One Corrective or Preventive Action (CAPA)."""
    action_type: str = Field(description="Either 'Corrective' (fix this issue) or 'Preventive' (stop it recurring)")
    action_description: str = Field(description="What exactly should be done")
    rationale: str = Field(description="Which root cause this action addresses and why")
    owner_department: str = Field(description="Responsible department, e.g. Production, QA, Engineering")
    target_days: int = Field(description="Days allowed to complete the action")


class DeviationDetails(BaseModel):
    """AI step 1 - facts extracted from the deviation report."""
    deviation_id: str = Field(description="Deviation number, e.g. DEV-2026-014. Use 'Not provided' if unknown")
    title: str = Field(description="Short title of the deviation")
    api_product_name: str = Field(description="Active Pharmaceutical Ingredient name, e.g. Paracetamol")
    batch_number: str = Field(description="Affected batch number")
    department: str = Field(description="Department where the deviation happened")
    incident_date: str = Field(description="Date of the incident, format YYYY-MM-DD if known")
    severity: str = Field(description="One of: Critical, Major, Minor")
    incident_summary: str = Field(description="Clear factual summary of what happened")


class RootCauseAnalysis(BaseModel):
    """AI step 2 - the investigation itself.
    Lists default to empty: if the AI forgets one, we get [] instead of a failed request."""
    investigation_method: str = Field(description="Either '5 Whys' or 'Fishbone'")
    five_whys: list[FiveWhyStep] = Field(default_factory=list, description="Chain of 5 why-steps from the problem down to the root cause")
    fishbone: FishboneCategory = Field(default_factory=FishboneCategory, description="Possible causes grouped into the 6M categories")
    potential_root_causes: list[RootCauseItem] = Field(default_factory=list, description="2 to 4 candidate root causes, most likely first")
    contributing_factors: list[str] = Field(default_factory=list, description="Factors that made the issue worse but are not the root cause")
    missing_evidence: list[str] = Field(
        default_factory=list,
        description="Records still needed to confirm the root cause, e.g. batch records, "
                    "calibration logs, operator interviews, equipment maintenance logs",
    )


class CapaPlan(BaseModel):
    """AI step 3 - corrective and preventive actions."""
    capa_recommendations: list[CapaItem] = Field(default_factory=list, description="Corrective AND preventive actions linked to the root causes")


class RcaAnalysisResult(DeviationDetails, RootCauseAnalysis, CapaPlan):
    """The complete RCA investigation for one deviation."""
    qa_reviewer_notes: str = Field(default="", description="Left empty by the AI; filled in by the QA reviewer")
    status: str = Field(default="Draft - AI Suggested", description="Workflow status of the investigation")


class AnalyzeTextRequest(BaseModel):
    """Body of POST /api/rca/analyze-text"""
    text: str = Field(min_length=20, description="Pasted deviation report / email / log")
    method: str = Field(default="5 Whys", description="'5 Whys' or 'Fishbone'")


class RcaInvestigationResponse(RcaAnalysisResult):
    """
    A SAVED investigation = all RCA fields + database fields (id, created_at).
    Used when reading rows back from PostgreSQL.
    """
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
