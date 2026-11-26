from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db() -> bool:
    from app import models

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except OperationalError as error:
        print(
            "\n" + "=" * 70 + "\n"
            "  DATABASE NOT AVAILABLE - could not connect to PostgreSQL\n"
            + "=" * 70 + "\n"
            f"  Tried: {engine.url.render_as_string(hide_password=True)}\n"
            f"  Error: {str(error.orig).strip()}\n\n"
            "  How to fix:\n"
            "   1. Start PostgreSQL:\n"
            "        Windows : open 'Services' and start 'postgresql-x64-<version>'\n"
            "                  (or: net start postgresql-x64-16  in an Admin terminal)\n"
            "        Docker  : docker run --name pharma-db -e POSTGRES_PASSWORD=password\n"
            "                  -e POSTGRES_DB=pharma_rca -p 5432:5432 -d postgres:16\n"
            "   2. Create the database (if it does not exist yet):\n"
            "        psql -U postgres -c \"CREATE DATABASE pharma_rca;\"\n"
            "   3. Check DATABASE_URL in backend/.env (user, password, port).\n"
            "   4. Restart the API: uvicorn app.main:app --reload\n"
            "\n  The API will keep running, but saving/loading investigations will fail.\n"
            + "=" * 70 + "\n"
        )
        return False

    Base.metadata.create_all(bind=engine)
    print("Database connected - tables are ready.")
    return True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
