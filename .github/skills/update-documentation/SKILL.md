---
name: update-documentation
description: Generate or update UML diagrams (sequence, class, flow) using Mermaid syntax inside existing Markdown files
---

Update a Markdown documentation file with a Mermaid UML diagram.

Inputs:
- Markdown file path
- Diagram type (optional): `sequence`, `class`, or `flow`

Supported diagram types (explicitly provided or inferred from context):
- `sequence` — interaction between components/services over time
- `class` — class structure and relationships
- `flow` — process or decision flow

Rules:
1. Read the target Markdown file first to understand existing content
2. Generate the appropriate Mermaid diagram block (` ```mermaid ... ``` `)
3. Insert or replace the diagram in the relevant section — do not remove unrelated content
4. Keep diagram labels concise and accurate to the actual code/architecture
5. If the file does not exist, create it with a minimal structure before adding the diagram

Completion criteria:
- The Markdown file contains the updated Mermaid block
- Unrelated documentation content is preserved
- The response includes the diagram syntax and a brief explanation
