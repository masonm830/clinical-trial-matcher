from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Date, DateTime, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"

    id = Column(Integer, primary_key=True, index=True)
    nct_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String)
    status = Column(String)
    condition = Column(String)
    description = Column(Text)
    eligibility_criteria = Column(Text)
    min_age = Column(String)
    max_age = Column(String)
    location_city = Column(String)
    location_state = Column(String)
    location_country = Column(String)
    phase = Column(String)
    sponsor = Column(String)
    last_updated = Column(Date)

    parsed_eligibility = relationship("ParsedEligibility", back_populates="trial", uselist=False)


class ParsedEligibility(Base):
    __tablename__ = "parsed_eligibility"

    id = Column(Integer, primary_key=True)
    trial_id = Column(Integer, ForeignKey("clinical_trials.id"), unique=True, nullable=False, index=True)
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    sex_restriction = Column(String, nullable=True)
    included_conditions = Column(JSON, default=list)
    excluded_conditions = Column(JSON, default=list)
    excluded_medications = Column(JSON, default=list)
    excluded_allergies = Column(JSON, default=list)
    other_notes = Column(Text, nullable=True)
    parsed_at = Column(DateTime, default=datetime.utcnow)

    trial = relationship("ClinicalTrial", back_populates="parsed_eligibility")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
