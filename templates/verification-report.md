# Verification Report

## Commands Run

## Success Criteria

Map every criterion from the issue or plan to evidence and a status. Use Passed, Failed or Not verified; Passed requires actual evidence. Keep untested criteria visible.

| Criterion | Evidence | Status |
| --- | --- | --- |
| [criterion from issue/plan] | [evidence link, or none] | Not verified |

## Hidden Regression Preflight

| Field | Evidence / source | Status |
| --- | --- | --- |
| Latest definition source | [schema/signature, path/migration/revision, known applied state] | Not verified |
| Preserved behavior | [prior behavior list and regression/diff evidence] | Not verified |
| Runtime loaded latest bundle | [runtime revision/module and observed changed method/behavior] | Not verified |

Use N/A only with a reason when the work does not touch DB/RPC or shared/frontend dependencies. Record compile/typecheck separately from runtime verification. See `docs/hidden-regression-preflight.md`.

## Results

## Manual Checks

## Not Verified

## Evidence Links

## UI Visual / Runtime Verification

Choose worst/edge case by risk, not first passing case. Record N/A with a reason for irrelevant cases; no runtime/evidence means Not verified, even if unit/build succeeds.

| Criterion / case and selection reason | Environment / URL / revision | Viewport / device | Input / expected / actual | Screenshot / interaction evidence | Status |
| --- | --- | --- | --- | --- | --- |
| [multi-image, long text, empty/error/resume or relevant boundary] | [tested runtime] | [supported viewport/device] | [repro and observed result] | [path/link or none] | Not verified |

For defects found during UAT, record pre-existing vs regression vs unknown with baseline/revision evidence; do not guess causality. Keep unresolved defects visible in handoff.
