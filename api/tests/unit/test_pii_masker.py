"""Unit tests for PIIMasker (P-28)."""
from __future__ import annotations

import pytest

from app.security.pii_masker import PIIMasker


@pytest.fixture()
def masker():
    return PIIMasker()


# ---------------------------------------------------------------------------
# Default sensitive field names
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "field_name",
    [
        "ssn",
        "SSN",
        "social_security_number",
        "credit_card",
        "card_number",
        "cvv",
        "ccv",
        "password",
        "passwd",
        "secret",
        "api_key",
        "access_token",
        "refresh_token",
        "private_key",
        "date_of_birth",
        "dob",
        "phone_number",
        "phone",
        "mobile",
    ],
)
def test_default_sensitive_field_masked(masker, field_name):
    result = masker.mask({field_name: "sensitive-value"})
    assert result[field_name] == "[MASKED]", f"Field '{field_name}' should be masked"


def test_sensitive_number_field_masked_as_zero(masker):
    result = masker.mask({"ssn": 123456789})
    assert result["ssn"] == 0


def test_non_sensitive_field_passes_through(masker):
    result = masker.mask({"action_type": "charge_customer", "amount": 100})
    assert result["action_type"] == "charge_customer"
    assert result["amount"] == 100


# ---------------------------------------------------------------------------
# Nested dict masking
# ---------------------------------------------------------------------------


def test_nested_sensitive_field_masked(masker):
    payload = {
        "customer": {
            "name": "Alice",
            "password": "hunter2",
            "address": {"city": "NYC"},
        }
    }
    result = masker.mask(payload)
    assert result["customer"]["name"] == "Alice"
    assert result["customer"]["password"] == "[MASKED]"
    assert result["customer"]["address"]["city"] == "NYC"


def test_deeply_nested_masking(masker):
    payload = {"level1": {"level2": {"level3": {"api_key": "sk-secret"}}}}
    result = masker.mask(payload)
    assert result["level1"]["level2"]["level3"]["api_key"] == "[MASKED]"


def test_list_of_dicts_masked(masker):
    payload = {
        "records": [
            {"name": "Alice", "ssn": "123-45-6789"},
            {"name": "Bob", "ssn": "987-65-4321"},
        ]
    }
    result = masker.mask(payload)
    assert result["records"][0]["name"] == "Alice"
    assert result["records"][0]["ssn"] == "[MASKED]"
    assert result["records"][1]["ssn"] == "[MASKED]"


# ---------------------------------------------------------------------------
# Email masking — context-dependent
# ---------------------------------------------------------------------------


def test_email_not_masked_at_top_level(masker):
    result = masker.mask({"email": "user@example.com"})
    # Top-level email is legitimate routing metadata — should NOT be masked as a key
    # (but the value may match the email pattern and be replaced)
    # Key-level masking should not apply at top level
    assert result["email"] != "[MASKED]"


def test_email_masked_inside_pii_fields(masker):
    payload = {"pii_fields": {"email": "user@example.com"}}
    result = masker.mask(payload)
    assert result["pii_fields"]["email"] == "[MASKED]"


def test_email_masked_inside_sensitive_data(masker):
    payload = {"sensitive_data": {"email": "user@example.com"}}
    result = masker.mask(payload)
    assert result["sensitive_data"]["email"] == "[MASKED]"


# ---------------------------------------------------------------------------
# Value-level SSN pattern detection
# ---------------------------------------------------------------------------


def test_ssn_pattern_in_value_masked(masker):
    result = masker.mask({"note": "Patient SSN is 123-45-6789"})
    assert result["note"] == "[MASKED:SSN]"


def test_ssn_pattern_standalone(masker):
    result = masker.mask({"identifier": "123-45-6789"})
    assert result["identifier"] == "[MASKED:SSN]"


# ---------------------------------------------------------------------------
# Value-level credit card pattern detection
# ---------------------------------------------------------------------------


def test_credit_card_pattern_in_value_masked(masker):
    result = masker.mask({"note": "Card: 4111 1111 1111 1111"})
    assert result["note"] == "[MASKED:CARD]"


def test_credit_card_with_dashes(masker):
    result = masker.mask({"card": "4111-1111-1111-1111"})
    assert result["card"] == "[MASKED:CARD]"


# ---------------------------------------------------------------------------
# Value-level email pattern detection
# ---------------------------------------------------------------------------


def test_email_pattern_in_non_sensitive_value_masked(masker):
    # Non-sensitive key but value looks like an email — gets pattern-masked
    result = masker.mask({"routing_address": "user@example.com"})
    assert result["routing_address"] == "[MASKED:EMAIL]"


# ---------------------------------------------------------------------------
# Non-sensitive fields pass through unchanged
# ---------------------------------------------------------------------------


def test_non_sensitive_fields_untouched(masker):
    payload = {
        "action_type": "update_record",
        "amount": 99.99,
        "customer_id": "cust-001",
        "metadata": {"source": "crm", "priority": 1},
    }
    result = masker.mask(payload)
    assert result == payload


# ---------------------------------------------------------------------------
# MASKED_FIELDS env var adds custom fields
# ---------------------------------------------------------------------------


def test_custom_masked_fields_env_var(masker, monkeypatch):
    monkeypatch.setenv("MASKED_FIELDS", "account_number, routing_number")
    result = masker.mask({"account_number": "12345678", "routing_number": "087654321", "amount": 50})
    assert result["account_number"] == "[MASKED]"
    assert result["routing_number"] == "[MASKED]"
    assert result["amount"] == 50


def test_custom_masked_fields_case_insensitive(masker, monkeypatch):
    monkeypatch.setenv("MASKED_FIELDS", "TaxId")
    result = masker.mask({"taxid": "123-45-678", "name": "Alice"})
    assert result["taxid"] == "[MASKED]"
    assert result["name"] == "Alice"


def test_original_payload_not_mutated(masker):
    original = {"password": "secret", "name": "Alice"}
    original_copy = dict(original)
    masker.mask(original)
    assert original == original_copy
