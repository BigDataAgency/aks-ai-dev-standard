# Test Scenario Report Template

> ใช้สำหรับ QA/product evidence: test case / scenario execution พร้อม screenshot capture และ report generation เท่านั้น ไม่ใช่ Employee Daily Log v5, performance review, score, KPI หรือการประเมินบุคคล

## Summary

- Report title:
- Product/feature:
- Environment: local / dev / staging / production-read-only / other
- Base URL:
- Build/version/commit:
- Date/time:
- Tester/agent/tool:
- Role/account type used:
- Test account classification: no credentials / real user / synthetic test / impersonation / limited-role / production read-only / other
- Credentials/secrets included in report? no only
- Browser/device/viewport:
- Data/privacy constraints:

## Non-performance confirmation

- [ ] This report is QA/product evidence
- [ ] This report is not Employee Daily Log v5
- [ ] This report is not a performance review, score, KPI, daily performance, or individual evaluation
- [ ] Role/team/account context is only for scenario reproducibility

## Production read-only guardrail checklist

- Environment contains production/real data? yes / no / unknown
- Allowed actions: view-only / navigation-only / no submit / no mutation / other:
- Forbidden production actions checked: create / edit / delete / approve / reject / upload / import / export / download sensitive docs
- Explicit scope allows production write action? no / yes, specify approval and action:
- Auth/session bypass attempted? no only
- No-mutation/network-write criteria:
- Stop condition for PII/write-risk:

## Test account classification

- Account/session used: no credentials / real user / synthetic test / impersonation / limited-role / production read-only / privileged admin
- Authorized by / scope reference, no secret:
- Roles/permissions expected:
- Roles/permissions observed:
- Credentials/tokens/passwords included? no only
- Limitations from account/session:

## Navigation and scope notes

- User-facing navigation rule: visible-menu navigation used? yes / no / not applicable
- Direct URL/hidden route used? no / yes, technical verification only:
- Standard wording if direct URL used: Technical verification only — this direct URL/hidden route check verifies observed routing/auth behavior under the stated session and permissions. It must not be claimed as a completed user-facing journey unless reachable via visible navigation.
- Production write risk: none / controlled test data / blocked / other:
- Route source types used: visible menu / direct URL / source code route / old docs / browser redirect / deployed bundle
- Out of scope:

## Test matrix

This section is the test matrix for scenario status, console notes, severity, and recommendations.

- Scenario ID: TC-001
  - Title:
  - Priority: P0 / P1 / P2 / P3
  - Role/account class:
  - Entry point / menu path:
  - Route source trace: VISIBLE_MENU / DIRECT_URL_USER / DIRECT_URL_TECHNICAL / SOURCE_CODE_ROUTE / OLD_DOCS_ROUTE / BROWSER_REDIRECT / DEPLOYED_BUNDLE_OBSERVED
  - Status: PASS / FAIL / INFO / LIMITED / PASS_NO_MUTATION / BLOCKED_NO_MUTATION / BLOCKED_NO_CREDENTIALS / BLOCKED_NO_ROLE / BLOCKED_PRODUCTION_WRITE_RISK / BLOCKED_PII_MASKING_REQUIRED / BLOCKED_ROUTE_DRIFT / NOT_RUN_RISK / NOT_RUN
  - No mutation/network write verified? yes / no / not applicable
  - Severity if issue: Critical / High / Medium / Low / Info / none
  - Screenshot evidence:
  - Issue / recommendation:

- Scenario ID: TC-002
  - Title:
  - Priority: P0 / P1 / P2 / P3
  - Role/account class:
  - Entry point / menu path:
  - Route source trace: VISIBLE_MENU / DIRECT_URL_USER / DIRECT_URL_TECHNICAL / SOURCE_CODE_ROUTE / OLD_DOCS_ROUTE / BROWSER_REDIRECT / DEPLOYED_BUNDLE_OBSERVED
  - Status: PASS / FAIL / INFO / LIMITED / PASS_NO_MUTATION / BLOCKED_NO_MUTATION / BLOCKED_NO_CREDENTIALS / BLOCKED_NO_ROLE / BLOCKED_PRODUCTION_WRITE_RISK / BLOCKED_PII_MASKING_REQUIRED / BLOCKED_ROUTE_DRIFT / NOT_RUN_RISK / NOT_RUN
  - No mutation/network write verified? yes / no / not applicable
  - Severity if issue: Critical / High / Medium / Low / Info / none
  - Screenshot evidence:
  - Issue / recommendation:


## Auth/RBAC matrix

- Role/account class: unauthenticated / real user / synthetic test / impersonation / limited-role / admin / no credentials
  - Route/module/action:
  - Expected access: allow / deny / redirect / read-only / no-mutation
  - Actual access:
  - Final URL / deny message:
  - Evidence screenshot label/path:
  - Console/network summary:
  - Status / blocked reason:

## Route source trace and route drift / SPA 404 checks

- Route/path:
  - Scenario ID:
  - Source trace: visible menu / direct URL from user / technical direct URL / source code route / old docs / browser redirect / deployed bundle
  - Visible-menu reachable? yes / no / not checked
  - HTTP status:
  - Final URL:
  - App-level result: expected page / app-level SPA 404 / HTTP 404 / redirect to auth / blank page / runtime crash
  - Drift result: ROUTE_OK / ROUTE_MISSING / MENU_DRIFT / DOC_DRIFT / DEPLOY_DRIFT / APP_LEVEL_404 / HTTP_404 / BLANK_OR_CRASH
  - Notes / source files checked:

## Scenario details

### TC-001 — <title>

- Objective:
- Preconditions:
- Test data used, masked:
- Account classification / role:
- Entry point / visible menu path:
- Route source trace:
- Technical verification only? no / yes, reason and standard wording used:
- No-mutation/network-write criteria:

#### Steps, expected, actual, evidence

- Step 1:
  - Action:
  - Expected:
  - Actual:
  - Status: PASS / FAIL / INFO / LIMITED / PASS_NO_MUTATION / BLOCKED_* / NOT_RUN
  - Blocked reason if any: BLOCKED_NO_CREDENTIALS / BLOCKED_NO_ROLE / BLOCKED_PRODUCTION_WRITE_RISK / BLOCKED_PII_MASKING_REQUIRED / BLOCKED_ROUTE_DRIFT / other
  - Screenshot: `screenshots/TC-001-01-<state>.png` or `MEDIA:/absolute/path/to/TC-001-01-<state>.png`
  - Notes:

- Step 2:
  - Action:
  - Expected:
  - Actual:
  - Status: PASS / FAIL / INFO / LIMITED / PASS_NO_MUTATION / BLOCKED_* / NOT_RUN
  - Blocked reason if any: BLOCKED_NO_CREDENTIALS / BLOCKED_NO_ROLE / BLOCKED_PRODUCTION_WRITE_RISK / BLOCKED_PII_MASKING_REQUIRED / BLOCKED_ROUTE_DRIFT / other
  - Screenshot: `screenshots/TC-001-02-<state>.png` or `MEDIA:/absolute/path/to/TC-001-02-<state>.png`
  - Notes:

#### Console / network / log observations

- Console errors: none observed / list errors with timestamp and page
- Network/API failures: none observed / list endpoint, status, impact
- Network write/mutation requests observed: none / list method, endpoint, purpose, safe/unsafe
- HTTP status / final URL / app-level 404:
- Server/app logs checked: yes / no / not available

#### Issue assessment

- Issue summary:
- Severity: Critical / High / Medium / Low / Info / none
- User/product impact:
- Recommendation:
- Retest needed: yes / no

## Evidence manifest / screenshot inventory

- File: `screenshots/TC-001-01-start.png`
  - Scenario/step:
  - Page/URL:
  - Expected/actual shown:
  - Console summary:
  - Network summary:
  - Contains PII/secret/customer/payment data? yes / no / unknown
  - Masking applied? yes / no / not needed
  - Safe to share externally? yes / no

- File: `screenshots/TC-001-02-result.png`
  - Scenario/step:
  - Page/URL:
  - Expected/actual shown:
  - Console summary:
  - Network summary:
  - Contains PII/secret/customer/payment data? yes / no / unknown
  - Masking applied? yes / no / not needed
  - Safe to share externally? yes / no

## Issues and recommendations

- Issue ID: QA-001
  - Related scenario:
  - Severity:
  - Evidence:
  - Recommendation:
  - Owner/team if known, optional:
  - Suggested next step:

## BDA Standard files used

-

## Pipeline trace

- Understand:
- Guardrail:
- Plan:
- Execute:
- Verify:
- Handoff:

## Production Read-only Guardrail

- Summary of guardrail applied:
- Forbidden actions avoided:
- No-mutation/no-network-write result:

## Auth/RBAC Matrix

- See section above / not applicable because:

## Route Source Trace

- See section above / not applicable because:

## Evidence Manifest

- See section above / evidence folder:

## Commands run

-

## Verification / Evidence

- Report path:
- Screenshot folder:
- Evidence manifest path/section:
- Screenshot paths / MEDIA paths with labels:
- Console/network summary:
- Route drift / SPA 404 evidence:
- Auth/RBAC evidence:
- No-mutation/network-write verification:
- Manual checks:

## Limitations / Risks / Next steps

-
