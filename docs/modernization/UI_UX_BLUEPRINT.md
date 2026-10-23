# DairyOS UI/UX Blueprint

## Experience goals

Keep the current DairyOS identity—forest green `#1b4332`, sage `#52b788`, warm cream `#faf8f5`, gold `#c59b27`—and organize the ERP around tasks users recognize: receive milk, check quality, move/chill milk, process a batch, manage farmers, reconcile payables, fulfill orders. Avoid presenting sample values as live operational facts.

Build two views over the same data, validation, API and permission rules:

- **Simple Mode:** task-focused home, common actions, guided steps, plain English/Hindi labels, fewer visible fields, large touch controls, contextual help, explicit save/sync status and recovery guidance.
- **Advanced Mode:** the same actions plus filters, reconciliations, detailed ledgers, audit history, configuration and analytic drill-downs, shown only to authorized roles.

Mode selection is presentation only. It must never change authorization, business rules or data ownership.

## Navigation and role workspaces

Use task groups rather than a flat sequence of 20 equally weighted modules:

1. **Today:** role-specific tasks, pending approvals, exceptions, freshness timestamp.
2. **Procurement:** farmer directory, collection, quality, milk pool, farmer balances.
3. **Plant:** chilling, processing, finished goods, inventory, maintenance/quality.
4. **Commercial:** orders, delivery, invoices, receipts and reconciliation.
5. **Management:** finance, reports, control tower, AI insights.
6. **Administration:** users, permissions, cooperative/facility, policy and audit.

Role starting views: CEO/Administrator management overview; Operations Manager workflow overview; Procurement Manager farmer and collection tasks; Plant Manager silo/batch/quality; Finance Manager ledger and reconciliation; Collection Operator / Field Staff fast intake with offline status; Farmer a separate, self-only portal. Hide irrelevant navigation for simplicity but enforce every action on the server.

## Shared component plan

Reuse the current `Modal`, `MetricCard`, `StatusBadge`, `ToastContainer`, charts, sidebar/topbar and existing collection, invoice, quality and payout components as a starting point. Establish common components before rewriting pages:

- `PageHeader`, `TaskCard`, `KpiCard`, `DataTable`, `FilterBar`, `EmptyState`, `InlineError`, `LoadingState`, `ConfirmAction`, `FormField`, `NumberInput`, `Date/Shift picker`, `StatusBadge`, `SaveState`, `OfflineQueueIndicator`, `AuditTimeline`.
- Form components share label, help, unit, validation and focus behavior. Show a review step before high-impact operations such as collection close, tank transfer, batch launch, payment state change and inventory adjustment.
- Use one mutation-state pattern: idle → submitting → confirmed/rejected; only show success after authoritative server acknowledgement. Offline entry has a distinct “saved on this device, pending sync” message.
- Tables must keep row actions keyboard accessible, provide meaningful empty/error states, and have a mobile card/list layout where dense columns do not fit.

## English and Hindi

Introduce a typed localization catalogue (English source plus reviewed Hindi translations), plural/number/date/currency formatting with `Intl`, and language selection stored per user. Use bilingual labels during rollout where space allows, with Hindi as a full UI locale rather than inline translations. Avoid concatenating sentences from translated fragments. Preserve entered names and village/address text as user data. Translation review should include dairy cooperative terminology and numerals/units. Current source contains hard-coded English and has no localization framework; Hindi readiness is NOT VERIFIED.

## Accessibility and responsive behavior

Target WCAG 2.2 AA:

- Semantic headings, landmarks, labels and table headers; keyboard-first navigation and visible focus; modal focus trap/return; no keyboard traps.
- Text contrast, status not conveyed by color alone, zoom/reflow at 320 CSS px, touch targets at least 24×24 CSS px with larger controls in Simple Mode.
- Announce async results and validation errors; associate field errors programmatically; respect reduced motion; provide captions/instructions for device operations.
- Test with keyboard, screen reader, 200% zoom, large text, Hindi strings and low-bandwidth/mobile viewport. Run automated axe checks plus manual checks on critical collection, payment and inventory paths.

R0 has not performed a WCAG audit. Existing per-page responsiveness/accessibility is NOT VERIFIED.

## Trust and status language

Every data panel should identify its source, date/shift/facility scope and last successful refresh. Label predictions and samples. Do not use “real-time,” “settled,” “verified,” “certified,” or “synced” unless that state is backed by an authoritative event. Define distinct transaction statuses for saved locally, submitted, accepted, pending external confirmation, completed, failed and needs review. Display server validation errors next to the affected field and preserve entered values for correction.

## PWA and Android

The responsive React client and domain-facing API calls should be shared across browsers and Capacitor. Build offline capability around the durable field workflow rather than caching authenticated API responses. Ask for device permissions only at the action that needs them, explain why, and offer manual entry when hardware access is unavailable. Use native Capacitor plugins only for verified requirements such as camera, secure storage, Bluetooth/serial device access, filesystem or push notifications; keep domain rules in TypeScript modules and server APIs. Android permissions, signing, supported devices and update behavior require a device test matrix.
