---
trigger: always_on
description: Code quality, strict TypeScript, unit/integration testing, and verification standards
---

# Quality & Verification Rules

1. **Strict TypeScript**:
   - `strict: true` must be enabled in `tsconfig.json`.
   - Avoid `any` types. Define explicit interfaces and union types for all domain models, actions, and selectors.
2. **Automated Testing**:
   - Every Redux slice reducer and derived selector formula must be covered by unit tests.
   - The Redux Domino Effect (one action updating all four zones simultaneously) must be verified with component integration tests using React Native Testing Library.
   - Never claim a test passed without executing it via Jest.
3. **Verification Cycle**:
   - Follow `PLAN -> IMPLEMENT -> TEST -> REVIEW -> FIX -> VERIFY`.
   - Run TypeScript typechecking (`npx tsc --noEmit`), ESLint (`npm run lint`), and Jest tests (`npm test -- --watchAll=false`) before marking any milestone complete.
4. **Honest Reporting**:
   - Record all requirements and verification evidence in `docs/REQUIREMENTS_MATRIX.md`, `docs/PROGRESS.md`, and `docs/RUBRIC_AUDIT.md`.

