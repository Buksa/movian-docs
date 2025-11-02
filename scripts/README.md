# Documentation Scripts

This directory contains utility scripts to help with the Movian documentation project workflow.

## Available Scripts

### create-task-report.py

Automates the creation of task completion reports and progress tracking.

**Usage:**
```bash
python scripts/create-task-report.py <task-id> [task-description]
```

**Examples:**
```bash
# Create report for task 3.3
python scripts/create-task-report.py 3.3 "Create comprehensive glossary"

# Create report for task 4.1
python scripts/create-task-report.py 4.1 "Analyze plugin architecture"
```

**What it does:**
1. Creates a new task report from template in `task-reports/task-[id]-report.md`
2. Updates `PROGRESS.md` with a new completed task entry
3. Provides reminders for next steps (editing details, committing changes)

**Requirements:**
- Python 3.6+
- Run from the `movian-docs` directory root

## Task Completion Workflow

When completing a task, follow this workflow:

### 1. Complete the Task Work
- Implement all required deliverables
- Create/modify documentation files
- Test examples and validate content

### 2. Create Task Report
```bash
python scripts/create-task-report.py [task-id] "[task-description]"
```

### 3. Fill in Report Details
Edit the generated report file to include:
- Specific deliverables and files created
- Key findings and insights
- Challenges encountered and solutions
- Technical implementation details
- Quality assurance checklist

### 4. Update Progress Tracking
Edit `PROGRESS.md` to add:
- Accurate completion duration
- Specific deliverables list
- Any important notes or achievements

### 5. Commit Changes
```bash
git add .
git commit -m "docs: [task-id] - [brief description]

- [List of main deliverables]
- [Key achievements]
- [Any important notes]"
```

## Example Complete Workflow

```bash
# 1. Complete task work (create documentation files, etc.)

# 2. Create report
python scripts/create-task-report.py 3.3 "Create comprehensive glossary"

# 3. Edit the generated files:
#    - task-reports/task-3.3-report.md
#    - PROGRESS.md

# 4. Commit everything
git add .
git commit -m "docs: 3.3 - Create comprehensive glossary and technical terms

- Created comprehensive glossary with 50+ technical terms
- Implemented cross-reference system for automatic linking
- Added validation for term consistency across documentation
- Updated task completion report and progress tracking"
```

## Script Development

### Adding New Scripts

When adding new utility scripts:

1. **Follow naming convention**: Use descriptive names with hyphens
2. **Add documentation**: Include usage examples and requirements
3. **Update this README**: Add the new script to the list above
4. **Test thoroughly**: Ensure scripts work from the project root directory

### Script Requirements

All scripts should:
- Include proper error handling
- Provide clear usage instructions
- Work from the project root directory
- Follow Python PEP 8 style guidelines (for Python scripts)
- Include appropriate file encoding handling

## Troubleshooting

### Common Issues

**Script not found:**
```bash
# Make sure you're in the movian-docs directory
cd movian-docs
python scripts/create-task-report.py 3.3
```

**Permission denied:**
```bash
# On Unix systems, make scripts executable
chmod +x scripts/create-task-report.py
./scripts/create-task-report.py 3.3
```

**Python not found:**
```bash
# Try with python3 explicitly
python3 scripts/create-task-report.py 3.3
```

### Getting Help

If you encounter issues with the scripts:

1. Check that you're running from the correct directory
2. Verify Python 3.6+ is installed
3. Check file permissions
4. Review the script output for specific error messages

For script improvements or bug reports, document the issue in the project notes or task reports.