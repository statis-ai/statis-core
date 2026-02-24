"""Integration tests for subscription CRUD endpoints."""

import pytest


@pytest.mark.integration
class TestSubscriptionsCRUD:
    def test_create_subscription(self, client):
        resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/test",
        })
        assert resp.status_code == 201
        body = resp.json()
        assert body["entity_type"] == "account"
        assert body["destination"] == "https://hooks.example.com/test"
        assert body["status"] == "active"
        assert body["subscription_id"]

    def test_create_subscription_with_event_types(self, client):
        resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "event_types": ["ticket.updated", "plan.changed"],
            "destination": "https://hooks.example.com/filtered",
        })
        assert resp.status_code == 201
        body = resp.json()
        assert body["event_types"] == ["ticket.updated", "plan.changed"]

    def test_list_subscriptions(self, client):
        client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/a",
        })
        client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/b",
        })
        resp = client.get("/subscriptions")
        assert resp.status_code == 200
        assert len(resp.json()) >= 2

    def test_get_subscription(self, client):
        create_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/get",
        })
        sub_id = create_resp.json()["subscription_id"]

        resp = client.get(f"/subscriptions/{sub_id}")
        assert resp.status_code == 200
        assert resp.json()["subscription_id"] == sub_id

    def test_get_subscription_not_found(self, client):
        resp = client.get("/subscriptions/does-not-exist")
        assert resp.status_code == 404

    def test_pause_subscription(self, client):
        create_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/pause",
        })
        sub_id = create_resp.json()["subscription_id"]

        resp = client.post(f"/subscriptions/{sub_id}/pause")
        assert resp.status_code == 200
        assert resp.json()["status"] == "paused"

    def test_resume_subscription(self, client):
        create_resp = client.post("/subscriptions", json={
            "entity_type": "account",
            "destination": "https://hooks.example.com/resume",
        })
        sub_id = create_resp.json()["subscription_id"]

        client.post(f"/subscriptions/{sub_id}/pause")
        resp = client.post(f"/subscriptions/{sub_id}/resume")
        assert resp.status_code == 200
        assert resp.json()["status"] == "active"

    def test_pause_not_found(self, client):
        resp = client.post("/subscriptions/missing/pause")
        assert resp.status_code == 404

    def test_resume_not_found(self, client):
        resp = client.post("/subscriptions/missing/resume")
        assert resp.status_code == 404
