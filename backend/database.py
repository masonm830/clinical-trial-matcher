from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Date
from sqlalchemy.orm import declarative_base, sessionmaker

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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
