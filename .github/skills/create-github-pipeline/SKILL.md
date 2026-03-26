---
name: create-github-pipeline
description: Create or update a GitHub Actions CI workflow YAML with install, build, lint, unit tests, and coverage report steps scoped to a specific path
---

Create or update a GitHub Actions CI pipeline for a specific service path.

Inputs:
- Service path (example: `inventory-api`)

Expected behavior:
- Configure triggers for `push` and `pull_request`
- Scope workflow execution using `paths` so it only runs when files under the service path change

Required steps (in order):
1. Checkout code
2. Install dependencies
3. Run build
4. Run lint
5. Run unit tests
6. Generate and upload coverage report

Constraints:
- Store the workflow at `.github/workflows/<service-name>-ci.yml`
- Pin action versions (example: `actions/checkout@v4`)
- Configure Node.js with `actions/setup-node` when the project is Node-based
- Keep the workflow scoped to the provided service path

Completion criteria:
- The YAML workflow file is written or updated
- Workflow triggers are path-scoped to the service
- A short summary explains what each job step does
