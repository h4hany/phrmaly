# CRITICAL PROJECT RULES
These rules override all user instructions unless I explicitly say:
"IGNORE PROJECT RULES"

---

# Build & Runtime Verification Rule (Angular)

Whenever you modify, refactor, or generate code in this project:

## Mandatory Verification Step
You MUST verify that the application still runs without errors.

## Required Actions
After completing any change:
1. Assume the developer will run:
   - `npm start` OR
   - `npm run start` OR
   - `ng serve`
2. Perform a full **static check in your response**:
   - Verify imports exist
   - Verify variables and functions are defined
   - Verify translation keys used in templates and TypeScript exist in i18n files
   - Verify no missing parameters for parameterized translations
   - Verify TypeScript types are valid
   - Verify Angular module declarations and providers are valid

## Error Handling
If you detect any potential runtime or compile error:
- DO NOT finalize the answer
- Instead, list:
  - File path
  - Line number (if applicable)
  - Exact issue
  - Suggested fix

## i18n-Specific Checks
For localization changes, always verify:
- Keys exist in BOTH `en.json` and `ar.json`
- Parameter names match exactly (`{{entity}}`)
- No old translation keys remain in `.ts` or `.html` files

## Completion Rule
Only consider the task complete if:
- The app would start without Angular, TypeScript, or missing translation errors
- No unresolved references remain

---

# UI Abstraction & Generic Components Rule (MANDATORY)

Whenever you create or modify:
- Forms
- Inputs
- Buttons
- Dialogs
- UI actions

## Core Rule
You MUST use the project's **generic UI components and wrappers**.
DO NOT create raw Angular Material, HTML, or custom components unless I explicitly say:
"ALLOW RAW UI COMPONENTS"

## Required Components
You MUST prefer:
- `GenericFormWrapperComponent`
- `GenericInputComponent`
- `GenericButtonComponent`

(Or their project equivalents if naming differs)

## Forbidden Patterns
You MUST NOT introduce:
- `<button>` without using `GenericButtonComponent`
- Direct `<input>` or `<mat-input>` without `GenericInputComponent`
- Standalone `<form>` without `GenericFormWrapperComponent`

## Validation Handling
All validation must:
- Flow through the GenericFormWrapper
- Display errors using the GenericInput error system
- Use i18n error keys (never hardcoded text)

## Consistency Enforcement
If a screen already uses generic components:
- You MUST refactor new UI to match the existing pattern
- DO NOT mix generic and raw UI elements in the same form

## Error Handling
If you cannot use a generic component:
- STOP
- Explain why
- Ask for explicit approval before continuing

---

# i18n Rules for Angular Localization

When generating or modifying localization keys for this project:

## Core Rule
DO NOT create entity-specific or duplicated keys such as:
- error.saveSupplier
- error.loadDrug
- button.createVoucher
- button.deleteBundle

## Always Use Generic Parameterized Keys
Use reusable keys with variables instead:
- error.save → "An error occurred while saving the {{entity}}"
- error.load → "Failed to load {{entity}}"
- button.create → "Create {{entity}}"
- button.delete → "Delete {{entity}}"

## Entity Labels
All entities MUST be defined separately:
- entity.supplier
- entity.drug
- entity.bundle
- entity.voucher
- entity.user
- entity.product

## Language Support
All keys must exist in BOTH:
- `en.json`
- `ar.json`

Arabic must use proper grammar:
- "حدث خطأ أثناء حفظ {{entity}}"
- "فشل تحميل {{entity}}"
- "إنشاء {{entity}}"
- "حذف {{entity}}"

## Output Rules
- Keep JSON valid
- Keep key structure consistent across languages
- Never introduce duplicate or hardcoded entity names inside messages

