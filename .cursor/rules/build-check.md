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

