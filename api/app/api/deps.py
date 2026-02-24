import hashlib
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.api_key import ApiKey


def get_tenant_id(x_api_key: str = Header(...), db: Session = Depends(get_db)) -> str:
    """Security dependency to validate X-API-Key and return the associated tenant_id."""
    hashed_key = hashlib.sha256(x_api_key.encode()).hexdigest()
    api_key_record = db.query(ApiKey).filter(ApiKey.hashed_key == hashed_key).first()
    
    if not api_key_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
        
    return api_key_record.tenant_id
