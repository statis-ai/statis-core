"""aarm r5: add ed25519 signature columns to receipts

Revision ID: 0035_aarm_signed_receipts
Revises: 0034_aarm_decision_values
Create Date: 2026-04-19 00:00:00.000000

PR-AARM-02 — Ed25519 Receipt Signing.

Adds three nullable columns to the receipts table:

  * signature       TEXT           base64url Ed25519 signature bytes
  * signature_alg   VARCHAR(32)    algorithm tag (e.g. "ed25519-v1")
  * public_key_id   VARCHAR(64)    stable identifier of the signing key

The columns are intentionally nullable — pre-PR-AARM-02 receipts keep
NULL and continue to be verifiable via the SHA-256 hash chain that
`canonical_state_hash()` already produces. No backfill is performed:
re-deriving the exact bytes that an old receipt was built from is
fragile, so legacy receipts are documented as "predate AARM R5 signing"
rather than retro-signed with a potentially-different payload.

From this migration onward, every new receipt written by the route
handler carries a non-NULL `signature`, `signature_alg="ed25519-v1"`,
and `public_key_id` (defaulting to `stat-ed25519-dev` when
STATIS_SIGNING_KEY_ID is unset).

See app/crypto/signing.py for the canonical signing payload shape.
"""

import sqlalchemy as sa
from alembic import op


revision = "0035_aarm_signed_receipts"
down_revision = "0034_aarm_decision_values"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "receipts",
        sa.Column("signature", sa.Text(), nullable=True),
    )
    op.add_column(
        "receipts",
        sa.Column("signature_alg", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "receipts",
        sa.Column("public_key_id", sa.String(length=64), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("receipts", "public_key_id")
    op.drop_column("receipts", "signature_alg")
    op.drop_column("receipts", "signature")
