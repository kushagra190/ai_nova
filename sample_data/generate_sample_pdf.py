"""
generate_sample_pdf.py
----------------------
Creates sample_deviation_report.pdf for the "Upload Deviation PDF" demo.

Run from the project root (uses the backend virtual environment):
    backend\\venv\\Scripts\\python.exe -m pip install fpdf2      (one time only)
    backend\\venv\\Scripts\\python.exe sample_data\\generate_sample_pdf.py

fpdf2 is only needed for this demo script, so it is NOT in backend/requirements.txt.
Note: the built-in Helvetica font only supports basic characters, so we write
"NMT" (Not More Than) instead of the "<=" symbol.
"""
from pathlib import Path

from fpdf import FPDF

OUTPUT = Path(__file__).parent / "sample_deviation_report.pdf"

# Each section = (heading, list of lines)
SECTIONS = [
    ("1. Deviation Details", [
        "Deviation No.: DEV-2026-084",
        "Date of Occurrence: 2026-09-14",
        "Reported by: Shift In-charge, API Block A (Crystallization)",
        "Department: Production - Crystallization",
        "Product: Metformin Hydrochloride API",
        "Batch No.: MTF-2609A (Batch size: 600 kg)",
        "Equipment: Reactor R-104 (Glass-lined, 6 KL), Chilled water valve CV-104, RTD sensor TS-104",
    ]),
    ("2. Description of the Deviation", [
        "During release testing of batch MTF-2609A, HPLC analysis by QC showed Impurity-B at 0.42% "
        "against the specification limit of NMT 0.15%. All other impurities were within limits. "
        "The out-of-specification result was confirmed by a second analyst (Phase-I laboratory "
        "investigation found no analytical error).",
    ]),
    ("3. Observations During Preliminary Investigation", [
        "- Chilled water control valve CV-104 was found stuck partially closed for approximately "
        "38 minutes during the cooling ramp (planned ramp: 65 C to 5 C over 4 hours). The DCS trend "
        "shows a slower cooling rate during this period.",
        "- The 'Low cooling rate' alarm was raised at 22:06 but was acknowledged by the operator only "
        "at 22:41, during shift handover. No action was recorded in the batch record.",
        "- The calibration due date of RTD temperature sensor TS-104 had passed 4 days prior to the "
        "batch (due 2026-09-10). The calibration sticker shows the overdue date.",
        "- The solvent recovery batch log for the recovered methanol used in this batch is "
        "incomplete: the distillation end-point and water content (KF) entries are blank.",
        "- Previous 3 batches crystallized in R-104 showed Impurity-B at 0.09%, 0.11% and 0.12%.",
    ]),
    ("4. Immediate Actions Taken", [
        "- Batch MTF-2609A placed on QA HOLD; reprocessing NOT permitted without QA approval.",
        "- Reactor R-104 tagged 'Under Investigation'. Valve CV-104 isolated for maintenance check.",
        "- Recovered methanol lot RM-0912 quarantined pending re-testing.",
    ]),
    ("5. Request", [
        "QA is requested to perform a root cause investigation (5 Whys / Fishbone) and propose "
        "Corrective and Preventive Actions (CAPA).",
    ]),
]


def build_pdf():
    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title block
    pdf.set_font("Helvetica", "B", 15)
    pdf.cell(0, 10, "DEVIATION REPORT", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "API Manufacturing Site - Quality Management System (QMS)", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 6, "Form QA-DEV-001 | Confidential", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(4)

    # Sections
    for heading, lines in SECTIONS:
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_fill_color(230, 242, 240)
        pdf.cell(0, 8, heading, new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.set_font("Helvetica", "", 10.5)
        for line in lines:
            pdf.multi_cell(0, 6, line, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

    # Sign-off block
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 6, "Reported by: R. Sharma (Shift In-charge)    Reviewed by: ____________ (QA)    Date: 2026-09-15",
             new_x="LMARGIN", new_y="NEXT")

    pdf.output(str(OUTPUT))
    print(f"Created {OUTPUT}")


if __name__ == "__main__":
    build_pdf()
