from sqlalchemy import JSON, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class RCAInvestigation(Base):
    __tablename__ = "rca_investigations"

    id = Column(Integer, primary_key=True, index=True)
    deviation_id = Column(String(50), index=True)
    title = Column(String(255), nullable=False)
    api_product_name = Column(String(255))
    batch_number = Column(String(100), index=True)
    department = Column(String(100))
    incident_date = Column(String(50))
    severity = Column(String(20))
    status = Column(String(50), default="Draft - AI Suggested")
    investigation_method = Column(String(20))
    incident_summary = Column(Text)
    qa_reviewer_notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    five_whys = Column(JSON, default=list)
    fishbone = Column(JSON, default=dict)
    potential_root_causes = Column(JSON, default=list)
    contributing_factors = Column(JSON, default=list)
    missing_evidence = Column(JSON, default=list)
    capa_recommendations = Column(JSON, default=list)
