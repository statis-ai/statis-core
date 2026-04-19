.PHONY: help keygen test test-aarm

help:
	@echo "Statis Makefile targets:"
	@echo "  keygen    Generate a fresh Ed25519 keypair for receipt signing (AARM R5)"
	@echo "  test      Run the API unit test suite"
	@echo "  test-aarm Run only the AARM conformance tests"

# AARM R5 — generate an Ed25519 signing keypair.
# Writes the private key to .env.local (gitignored) in the env-var format
# the API expects (STATIS_SIGNING_PRIVATE_KEY=...) and prints the public
# key for reference. Never commit the private key.
keygen:
	@python3 -c "from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey; \
from cryptography.hazmat.primitives import serialization; \
priv = Ed25519PrivateKey.generate(); \
priv_pem = priv.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8, encryption_algorithm=serialization.NoEncryption()).decode(); \
pub_pem = priv.public_key().public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo).decode(); \
print('# --- paste into .env.local (gitignored) ---'); \
print('STATIS_SIGNING_PRIVATE_KEY=\"' + priv_pem.replace(chr(10), '\\\\n') + '\"'); \
print(''); \
print('# --- public key (served at /.well-known/aarm-pubkey) ---'); \
print(pub_pem)"

test:
	cd api && python3.11 -m pytest tests/unit/ -v

test-aarm:
	cd api && python3.11 -m pytest tests/unit/test_aarm_*.py -v
