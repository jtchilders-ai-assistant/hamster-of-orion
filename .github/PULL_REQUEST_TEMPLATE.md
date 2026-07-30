## Description
<!-- Describe your changes in detail. What does this PR solve? -->
Fixes # (issue number)

## Type of Change
<!-- Check the relevant boxes -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Asset integration (Art/Audio)

## Architecture Compliance Check
<!-- As per CONTRIBUTING.md, ensure you have not violated the core architecture rules. -->
- [ ] **DOM Separation:** I confirm that no code in `src/game/` accesses the `window`, `document`, or DOM APIs.
- [ ] **Logic Separation:** I confirm that no code in `src/ui/` mutates the GameState directly without dispatching an action.

## Testing & Verification
<!-- Describe the tests that you ran to verify your changes. Provide instructions so we can reproduce. -->
- [ ] I have added/updated Vitest unit tests for the logic modified in this PR.
- [ ] I ran `npm run test` and all tests passed locally.
- [ ] I ran `npm run lint` and resolved all ESLint and Prettier errors.
- [ ] (If applicable) I have manually tested the UI changes in the browser using the dev server.

## Media (If UI/Art change)
<!-- If this PR changes the UI, include before/after screenshots or a short screen recording here. -->
<!-- ![Before](link) ![After](link) -->

## Checklist for Reviewer
- [ ] Code follows the style guidelines of this project
- [ ] Code is self-documenting or contains JSDoc comments for complex logic
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
