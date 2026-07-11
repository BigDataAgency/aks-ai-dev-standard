# Security Policy

## Public-repository boundary

This repository is a public standards repository. It contains AKS AI Dev Standard (เดิม BDA AI Dev Standard) documentation, templates, prompts, command adapters, schemas, and smoke checks only.

The repository may include local/dry-run CLI client code and OpenAI-compatible gateway examples, but it must not include any secret or unauthenticated path to BDA private infrastructure. External users can run the standard with their own local models, model providers, or private gateways; see `docs/open-source-ai-dev-deployment-guide.md`.

It must not contain:

- Production BDA or InnoHub endpoints.
- Production credentials, bearer tokens, tenant secrets, API keys, database service keys, private keys, cookies, or session material.
- Automatic production-ingest code paths that send public-repository content into InnoHub by default.
- BDA private GPU hostnames, Tailscale IPs, LiteLLM master keys, paid-provider keys, or employee-specific gateway config.
- Customer data, personal data, screenshots with unmasked sensitive data, or operational secrets.

## Default operating mode

The default mode for this public repository is local output only:

```env
BDA_STANDARD_MODE=local
INNOHUB_INGEST_URL=
INNOHUB_INGEST_TOKEN=
INNOHUB_TENANT_ID=
```

Use `.env.example` as the only committed environment template. Real `.env` files are ignored and must remain local/private.

## Production InnoHub ingest boundary

Production ingest must be implemented outside this public repository through a private connector or deployment-specific service. That connector must require authenticated requests and must not trust this repository as an ingress source by itself.

Minimum production-ingest controls:

- Explicit bearer-token authentication and tenant identification.
- Optional request timestamp and HMAC signature verification for replay protection.
- Strict schema validation before accepting payloads.
- Rate limits, audit logs, and anomaly monitoring.
- Payload minimization and PII/secret redaction before transmission.
- Endpoint and tenant allowlists owned by the private deployment.
- No default auto-ingest behavior from this public repository.

See `docs/public-ingest-guardrails.md` for implementation guardrails.

## Reporting vulnerabilities or secrets

If you find a vulnerability, committed secret, production endpoint, or unsafe ingest path:

1. Do not open a public issue containing the secret or exploit details.
2. Rotate or revoke any exposed credential immediately in the owning private system.
3. Report privately to the BDA repository maintainers/security owner with:
   - Affected file/path and commit hash if known.
   - What was exposed and when it was observed.
   - Any evidence needed to reproduce without disclosing extra secrets.
4. Preserve public history only after confirming with the security owner whether history rewrite or public advisory is required.

## Maintainer checklist

Before release or publication, run:

```bash
scripts/security-public-repo-check.sh
python3 scripts/smoke-standard-scenarios.py
```

Do not publish a release if either check fails.
