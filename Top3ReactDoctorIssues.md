Fix the top 3 React Doctor issues in po-builder on this pass ÔÇö leave the rest for a follow-up.

1. WARN Security: Build pipeline runs code near secrets (├ù1)
   The build or install pipeline can execute package lifecycle code while CI secrets may be present.
   Curl with no cache & follow the canonical fix and false positive check recipe before fixing: https://react.doctor/docs/rules/react-doctor/build-pipeline-secret-boundary
   - .github/workflows/deploy.yml:32
2. ERROR Security: Permissive Supabase RLS policy (├ù2)
   Supabase policy SQL disables RLS, permits writes broadly, or references a service-role bypass.
   Curl with no cache & follow the canonical fix and false positive check recipe before fixing: https://react.doctor/docs/rules/react-doctor/supabase-rls-policy-risk
   - migrations/001_create_page_layouts.sql:25
   - migrations/002_auth.sql:16
3. WARN Performance: State only used in handlers (├ù1)
   Each update to "loadFailed" redraws your component for nothing because this useState is set but never shown on screen.
   Curl with no cache & follow the canonical fix and false positive check recipe before fixing: https://react.doctor/docs/rules/react-doctor/rerender-state-only-in-handlers
   - src/App.tsx:55

Full results for all 88 issues (diagnostics.json + a .txt per rule): C:\Users\Administrador\AppData\Local\Temp\react-doctor-0c931430-83d2-46ea-b8ba-52a5b8ba4435

Read each file and fix the root cause ÔÇö don't suppress or silence the rule.

Findings that share a `fixGroupId` (in diagnostics.json) are one root cause ÔÇö a single fix clears all of them, so treat each `fixGroupId` as ONE task, not one per site.

Verify against the real thing, don't assume: confirm each change matches the canonical fix recipe you fetched for that rule, then re-run `npx react-doctor@latest --verbose` and check the issue is actually gone against the real tool before moving on.

Teach me as you go: for every issue you touch, explain it in plain language (no jargon) ÔÇö what the problem is, why it's a problem, and how serious it is in human terms. Describe the real-world impact and severity concretely (e.g. "this crashes the page for users on Safari" vs. "this is a minor cleanup with no user impact") so I understand why it matters, not just what changed.

Then work through the rest from the full results above.