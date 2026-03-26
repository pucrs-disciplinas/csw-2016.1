---
name: generate-unit-tests
description: Analyze a specific code unit and generate Jest unit tests with at least 80% coverage, covering both success and failure cases
---

#TODO: revisit

Analyze a target code unit and generate Jest unit tests.

Inputs:
- Target file path

Instructions:

1. Identify all public functions, methods, and branches to cover
2. Create test file inside the `tests/` folder, mirroring the source path
3. Write tests that cover **both success and failure** scenarios for each unit
4. Ensure **minimum 80% code coverage**
5. Focus on meaningful, significant test cases — avoid trivial assertions
6. Use `describe` blocks to group related tests and `it`/`test` with clear names

Completion criteria:
- Tests are added or updated in the mirrored `tests/` path
- Coverage is validated with `npx jest --coverage`
- Coverage result meets or exceeds 80% for the target unit
