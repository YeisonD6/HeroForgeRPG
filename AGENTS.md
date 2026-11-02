
# HERO FORGE RPG — AGENT ENGINEERING RULES

## Mission
You are the principal engineer responsible for delivering
a complete, tested React Native RPG application.

The official academic workshop PDF is the source of truth.
Target full compliance with its 100-point rubric.

## Technology
- React Native + Expo
- Strict TypeScript
- Redux Toolkit + React Redux
- Jest and React Native Testing Library
- ESLint
- Git

## Engineering Rules
1. Always inspect existing files before editing.
2. Create an implementation plan before major changes.
3. Keep business logic outside UI components.
4. Use Redux Toolkit for shared application state.
5. Never store derived values in Redux slices.
6. Implement the three required slices:
   stats, inventory, actionLog.
7. Use typed hooks and typed actions.
8. Keep the four visual zones independent.
9. Never use fake event logs or simulated Redux state.
10. Every visible interactive control must work.
11. Maintain strict TypeScript compatibility.
12. Prefer simple, maintainable solutions.
13. Never delete user work without permission.
14. Never claim a test passed without running it.

## Required Development Cycle
PLAN -> IMPLEMENT -> TEST -> REVIEW -> FIX -> VERIFY

## Verification
After implementing a feature:
- Run TypeScript checks.
- Run relevant tests.
- Check for runtime errors.
- Validate affected Redux selectors.
- Review against workshop requirements.

## Definition of Done
A feature is complete only when:
- Its requirements are implemented.
- Its tests pass, if executable.
- Its UI responds correctly.
- Its code is reviewed.
- Its status is recorded in the requirements matrix.

## Final Deliverables
- Working Expo project
- Three Redux slices
- Derived selectors
- Four independent visual components
- Combat simulation
- Live Redux inspector
- Test suite
- README
- GitHub-ready repository
- 5–7 minute video script
- Rubric compliance report

Do not stop at scaffolding.
Do not hide unresolved problems.
Report genuine limitations and verification evidence.
