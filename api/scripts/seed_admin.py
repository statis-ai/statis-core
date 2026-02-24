import os
import sys
import uuid
import secrets
import hashlib
from datetime import datetime

# Add the parent directory to sys.path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.api_key import ApiKey
from app.db.base import Base

def get_database_url():
    # Priority: explicitly set DATABASE_URL, else standard Postgres URL
    return os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/statis"
    )

def main():
    print("Starting Admin Data Seeder...")
    database_url = get_database_url()
    
    # Using echo=False to keep logs clean
    engine = create_engine(database_url)
    
    # Ensure tables exist (specifically useful if Alembic hasn't run, but usually Alembic runs first)
    # Railway's cold start might benefit from ensuring schema before seating.
    # However, it's safer to rely on Alembic. Assuming Alembic has run.
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if an API key already exists
        existing_key = db.query(ApiKey).first()
        if existing_key:
            print("Found existing API keys in the database. Seed skipped.")
            return

        tenant_id = f"tenant_{uuid.uuid4().hex[:12]}"
        
        # Generate raw key and hash
        raw_key = f"st_{secrets.token_urlsafe(32)}"
        hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
        
        key_id = str(uuid.uuid4())
        master_key_record = ApiKey(
            id=key_id,
            hashed_key=hashed_key,
            tenant_id=tenant_id,
            label="Master Key (Bootstrap)",
            created_at=datetime.utcnow()
        )
        
        db.add(master_key_record)
        db.commit()
        
        print("====== BOOTSTRAP SUCCESS ======")
        print(f"Tenant ID: {tenant_id}")
        print(f"API Key:   {raw_key}")
        print("===============================")
        print("Please save these credentials securely. You won't be able to see this key again.")
        
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
