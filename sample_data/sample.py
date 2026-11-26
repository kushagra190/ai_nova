from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)

# Header
pdf.set_font("Helvetica", "B", 14)
pdf.cell(0, 10, "QUALITY ASSURANCE - MANUFACTURING DEVIATION REPORT", ln=True, align="C")
pdf.set_font("Helvetica", "B", 10)
pdf.cell(0, 6, "AIVOA Biopharma API Manufacturing Plant - Unit II (Crystallization Block)", ln=True, align="C")
pdf.ln(6)

# Metadata Block
pdf.set_font("Helvetica", "B", 11)
pdf.cell(0, 8, "1. DEVIATION METADATA", ln=True)
pdf.set_font("Helvetica", "", 10)
metadata = [
    "Deviation ID: DEV-2026-084",
    "Incident Title: Out-of-Specification (OOS) Impurity-B Excursion During Crystallization",
    "API Product Name: Metformin Hydrochloride USP (Active Pharmaceutical Ingredient)",
    "Batch Number: MTF-2609A",
    "Department / Area: API Synthesis & Crystallization - Bay 4 (Reactor R-104)",
    "Incident Date: November 22, 2026 | Shift: Night Shift (22:00 - 06:00)",
    "Severity Classification: Critical (Batch Quarantined)",
    "Reported By: Rajesh Verma (Senior Shift Chemist, Production)"
]
for line in metadata:
    pdf.cell(0, 6, line, ln=True)
pdf.ln(4)

# Body Sections
sections = [
    ("2. INCIDENT SUMMARY & TIMELINE",
     "During final crystallization of Metformin Hydrochloride Batch #MTF-2609A in glass-lined Reactor R-104, "
     "in-process Quality Control (IPQC) HPLC testing revealed Impurity-B at 0.42% w/w, exceeding the approved "
     "specification limit of NMT 0.15% w/w. Batch #MTF-2609A (450 kg) was immediately placed on QA Hold.\n\n"
     "Timeline of Events:\n"
     "- 01:15 AM: Cooling ramp initiated from 75 C to 15 C at a target rate of 10 C/hour.\n"
     "- 01:40 AM: Chilled water inlet valve CV-104 mechanically stuck at 20% open position due to scale buildup.\n"
     "- 01:48 AM: High-temperature deviation alarm triggered on SCADA HMI panel.\n"
     "- 02:26 AM: Operator acknowledged alarm 38 minutes late during shift handover briefing and manually bypassed CV-104.\n"
     "- 02:30 AM: Reactor temperature remained stalled at 58 C for 45 minutes, causing secondary thermal degradation "
     "and elevated Impurity-B formation."),
    
    ("3. PRELIMINARY SHOP-FLOOR OBSERVATIONS (6M FACTORS)",
     "- Machine / Equipment: Pneumatic actuator on chilled water valve CV-104 showed sluggish stem travel; "
     "preventive maintenance (PM) was overdue by 3 weeks.\n"
     "- Measurement: Reactor jacket RTD temperature sensor TS-104 bore a calibration sticker showing due date "
     "November 18, 2026 (4 days overdue at time of batch execution).\n"
     "- Manpower: Junior operator covering the panel during 01:45 AM shift handover missed the audible SCADA alarm "
     "because the alarm buzzer volume had been muted.\n"
     "- Method / Process: Standard Operating Procedure SOP-MFG-042 lacks a mandatory dual-operator verification "
     "step during critical cooling ramps.\n"
     "- Material: Mother liquor recycled from previous Batch #MTF-2608C was blended at 15% ratio without pre-use "
     "impurity profiling.\n"
     "- Environment: Chilled water header pressure dropped slightly due to high ambient humidity in Utility Block B."),

    ("4. INVESTIGATION GAPS & MISSING EVIDENCE",
     "The following records were not attached to the initial deviation packet and require QA verification:\n"
     "1. Official NABL-traceable calibration certificate and as-found drift report for RTD Sensor TS-104.\n"
     "2. Complete Solvent & Mother Liquor Recovery Log for recycled Batch #MTF-2608C.\n"
     "3. Signed Night-Shift Operator Handover Logbook and training records for the covering panel operator.\n"
     "4. Preventive Maintenance (PM) work order history for Chilled Water Valve CV-104 over the past 6 months.")
]

for title, body in sections:
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, title, ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5.5, body)
    pdf.ln(4)

pdf.output("sample_deviation_report.pdf")
print("Generated sample_deviation_report.pdf successfully!")