from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

def test_signup_creates_tenant_and_key(client: TestClient, db_session: Session):
    response = client.post(
        "/admin/signup", 
        json={"email": "test@example.com", "project_name": "Test Project"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "tenant_id" in data
    assert "api_key" in data
    assert data["api_key"].startswith("st_")
    assert "Master Key" in data["label"]

def test_create_and_list_api_keys(client: TestClient, db_session: Session):
    # 1. Signup first to get a valid tenant
    signup_resp = client.post(
        "/admin/signup", 
        json={"email": "dev@example.com", "project_name": "Dev Project"}
    )
    assert signup_resp.status_code == 201
    master_key = signup_resp.json()["api_key"]
    tenant_id = signup_resp.json()["tenant_id"]

    # 2. List keys (should be 1 master key)
    list_resp1 = client.get("/admin/api-keys", headers={"X-API-Key": master_key})
    assert list_resp1.status_code == 200
    keys = list_resp1.json()
    assert len(keys) == 1
    assert keys[0]["tenant_id"] == tenant_id
    assert keys[0]["key_preview"] == "st_••••••••••••••••"

    # 3. Create a new key
    create_resp = client.post(
        "/admin/api-keys",
        json={"label": "Secondary Key"},
        headers={"X-API-Key": master_key}
    )
    assert create_resp.status_code == 201
    new_key_data = create_resp.json()
    assert new_key_data["raw_key"].startswith("st_")
    assert new_key_data["label"] == "Secondary Key"
    
    new_raw_key = new_key_data["raw_key"]

    # 4. List keys again using the NEW key (should be 2 keys now)
    list_resp2 = client.get("/admin/api-keys", headers={"X-API-Key": new_raw_key})
    assert list_resp2.status_code == 200
    keys2 = list_resp2.json()
    assert len(keys2) == 2
    assert any("Master" in k["label"] for k in keys2)
    assert any("Secondary" in k["label"] for k in keys2)
