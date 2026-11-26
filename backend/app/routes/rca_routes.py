from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RCAInvestigation
from app.schemas import AnalyzeTextRequest, RcaAnalysisResult, RcaInvestigationResponse
from app.services.pdf_parser import extract_text_from_pdf
from app.services.rca_graph import run_rca_analysis
from app.services.sample_incident import SAMPLE_INCIDENT_TEXT

router = APIRouter(prefix="/api/rca", tags=["RCA"])

ALLOWED_METHODS = ("5 Whys", "Fishbone")


def analyze(text: str, method: str) -> RcaAnalysisResult:
    if method not in ALLOWED_METHODS:
        raise HTTPException(400, f"method must be one of {ALLOWED_METHODS}")
    try:
        return run_rca_analysis(text, method)
    except RuntimeError as error:
        raise HTTPException(500, str(error))
    except Exception as error:
        raise HTTPException(502, f"AI analysis failed: {error}")


def get_or_404(db: Session, investigation_id: int) -> RCAInvestigation:
    record = db.get(RCAInvestigation, investigation_id)
    if record is None:
        raise HTTPException(404, f"Investigation #{investigation_id} not found")
    return record


@router.post("/analyze-text", response_model=RcaAnalysisResult)
def analyze_text(request: AnalyzeTextRequest):
    return analyze(request.text, request.method)


@router.post("/analyze-pdf", response_model=RcaAnalysisResult)
async def analyze_pdf(file: UploadFile = File(...), method: str = Form("5 Whys")):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Please upload a .pdf file")
    try:
        text = extract_text_from_pdf(await file.read())
    except Exception:
        raise HTTPException(400, "Could not read this PDF. Is it a valid, non-encrypted PDF?")
    if len(text) < 20:
        raise HTTPException(422, "No readable text found in the PDF (scanned image PDFs are not supported).")
    return analyze(text, method)


@router.get("/sample-incident")
def sample_incident():
    return {"text": SAMPLE_INCIDENT_TEXT}


@router.post("/investigations", response_model=RcaInvestigationResponse, status_code=201)
def create_investigation(data: RcaAnalysisResult, db: Session = Depends(get_db)):
    record = RCAInvestigation(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/investigations", response_model=list[RcaInvestigationResponse])
def list_investigations(db: Session = Depends(get_db)):
    return db.query(RCAInvestigation).order_by(RCAInvestigation.created_at.desc()).all()


@router.get("/investigations/{investigation_id}", response_model=RcaInvestigationResponse)
def get_investigation(investigation_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, investigation_id)


@router.put("/investigations/{investigation_id}", response_model=RcaInvestigationResponse)
def update_investigation(investigation_id: int, data: RcaAnalysisResult, db: Session = Depends(get_db)):
    record = get_or_404(db, investigation_id)
    for field, value in data.model_dump().items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record
