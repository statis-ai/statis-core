# SSO Integration (Okta / Azure Entra ID)

Statis supports OIDC-based single sign-on. When enabled, users can authenticate via your organization's identity provider instead of (or in addition to) username/password.

## Prerequisites

- Statis API version with OIDC support (migration 0027+)
- An Okta developer account or Azure Entra ID tenant
- `authlib` installed: add `authlib` to `api/requirements.txt`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OIDC_ENABLED` | Set to `true` to enable SSO |
| `OIDC_PROVIDER` | `okta` or `entra` |
| `OIDC_CLIENT_ID` | OAuth2 client ID from your IdP |
| `OIDC_CLIENT_SECRET` | OAuth2 client secret from your IdP |
| `OIDC_DISCOVERY_URL` | OIDC well-known discovery endpoint URL |
| `OIDC_REDIRECT_URI` | Callback URL: `https://api.yourdomain.com/auth/oidc/callback` |
| `OIDC_POST_LOGIN_URL` | Where to redirect after login (default: `https://console.statis.dev`) |

## Okta Setup

1. Log in to [developer.okta.com](https://developer.okta.com) (free account available).
2. Go to **Applications → Create App Integration**.
3. Select **OIDC - OpenID Connect** and **Web Application**.
4. Set **Sign-in redirect URI** to `https://api.yourdomain.com/auth/oidc/callback`.
5. Copy the **Client ID** and **Client Secret**.
6. Your discovery URL is: `https://{your-okta-domain}/.well-known/openid-configuration`

Add to `.env`:
```
OIDC_ENABLED=true
OIDC_PROVIDER=okta
OIDC_CLIENT_ID=0oaxxxxxxxxxxxxxxx
OIDC_CLIENT_SECRET=your-client-secret
OIDC_DISCOVERY_URL=https://dev-xxxxxxxx.okta.com/.well-known/openid-configuration
OIDC_REDIRECT_URI=https://api.yourdomain.com/auth/oidc/callback
```

## Azure Entra ID Setup

1. Go to **Azure Portal → Microsoft Entra ID → App registrations → New registration**.
2. Set **Redirect URI** (Web) to `https://api.yourdomain.com/auth/oidc/callback`.
3. Go to **Certificates & secrets → New client secret**. Copy the value.
4. Your discovery URL is: `https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid-configuration`

Add to `.env`:
```
OIDC_ENABLED=true
OIDC_PROVIDER=entra
OIDC_CLIENT_ID=your-application-client-id
OIDC_CLIENT_SECRET=your-client-secret-value
OIDC_DISCOVERY_URL=https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid-configuration
OIDC_REDIRECT_URI=https://api.yourdomain.com/auth/oidc/callback
```

## How It Works

1. User clicks "Sign in with [Okta/Microsoft]" in the Statis console.
2. Console calls `GET /auth/oidc/login` → API redirects to IdP authorization URL.
3. User authenticates at the IdP.
4. IdP redirects to `GET /auth/oidc/callback?code=...`
5. API exchanges code for tokens, fetches userinfo (email, sub).
6. User is created in Statis DB if first login; existing users are linked by email.
7. Browser is redirected to the console with session credentials.

## Testing

Use a free Okta developer account at [developer.okta.com](https://developer.okta.com). Set up an app as above with `http://localhost:8000/auth/oidc/callback` as the redirect URI for local testing.

```bash
# Verify SSO is configured
curl http://localhost:8000/auth/oidc/config
# {"enabled": true, "provider": "okta"}

# Trigger login (opens browser)
open http://localhost:8000/auth/oidc/login
```
