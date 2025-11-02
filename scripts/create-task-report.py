#!/usr/bin/env python3
"""
Script to create a new task completion report from template.
Usage: python create-task-report.py <task-id> [task-description]
"""

import sys
import os
from datetime import datetime
import shutil

def create_task_report(task_id, task_description=""):
    """Create a new task report from template."""
    
    # Paths
    template_path = "task-reports/TEMPLATE.md"
    report_path = f"task-reports/task-{task_id}-report.md"
    
    # Check if template exists
    if not os.path.exists(template_path):
        print(f"Error: Template file {template_path} not found!")
        return False
    
    # Check if report already exists
    if os.path.exists(report_path):
        response = input(f"Report {report_path} already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return False
    
    # Read template
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace placeholders
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    replacements = {
        '[ID]': task_id,
        '[YYYY-MM-DD]': current_date,
        '[Brief description of the completed task from the task list]': task_description or f"Task {task_id} completion"
    }
    
    for placeholder, replacement in replacements.items():
        content = content.replace(placeholder, replacement)
    
    # Write new report
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Created task report: {report_path}")
    print(f"📝 Please edit the file to add specific details about task {task_id}")
    
    return True

def update_progress_file(task_id, task_description=""):
    """Add entry to PROGRESS.md file."""
    
    progress_path = "PROGRESS.md"
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    if not os.path.exists(progress_path):
        print(f"Warning: {progress_path} not found!")
        return False
    
    # Read current progress file
    with open(progress_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find insertion point (after "## Completed Tasks")
    insert_index = -1
    for i, line in enumerate(lines):
        if line.strip() == "## Completed Tasks":
            insert_index = i + 1
            break
    
    if insert_index == -1:
        print("Warning: Could not find '## Completed Tasks' section in PROGRESS.md")
        return False
    
    # Create new entry
    new_entry = f"""
### Task {task_id} - {task_description} ✅
- **Completed**: {current_date}
- **Duration**: [UPDATE DURATION]
- **Deliverables**: [UPDATE DELIVERABLES]
- **Report**: [Task {task_id} Report](task-reports/task-{task_id}-report.md)
"""
    
    # Insert new entry
    lines.insert(insert_index, new_entry)
    
    # Write updated file
    with open(progress_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"✅ Updated {progress_path} with task {task_id} entry")
    print(f"📝 Please edit PROGRESS.md to add specific details")
    
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python create-task-report.py <task-id> [task-description]")
        print("Example: python create-task-report.py 3.3 'Create comprehensive glossary'")
        sys.exit(1)
    
    task_id = sys.argv[1]
    task_description = sys.argv[2] if len(sys.argv) > 2 else ""
    
    print(f"Creating task report for Task {task_id}...")
    
    # Create report
    if create_task_report(task_id, task_description):
        # Update progress file
        update_progress_file(task_id, task_description)
        
        print(f"\n🎉 Task {task_id} report setup complete!")
        print(f"Next steps:")
        print(f"1. Edit task-reports/task-{task_id}-report.md with specific details")
        print(f"2. Update PROGRESS.md with accurate information")
        print(f"3. Commit changes: git commit -m 'docs: {task_id} - {task_description}'")
    else:
        print(f"❌ Failed to create task report for {task_id}")
        sys.exit(1)

if __name__ == "__main__":
    main()