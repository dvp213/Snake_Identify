import os
import re
import sys

def update_imports_in_file(file_path):
    """Update imports in a given file"""
    try:
        # Skip backup files and temporary files
        if file_path.endswith('.bak') or 'temp' in file_path:
            print(f"Skipping {file_path}")
            return
            
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace the import
        if 'from models.database import get_db' in content:
            updated_content = content.replace(
                'from models.database import get_db',
                'from core.dependencies import get_db'
            )
            
            # Write back the modified content
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
                
            print(f"Updated imports in {file_path}")
        else:
            print(f"No imports to update in {file_path}")
    except Exception as e:
        print(f"Error updating {file_path}: {e}")

def update_imports_in_directory(directory):
    """Update imports in all Python files in the directory"""
    if not os.path.isdir(directory):
        print(f"Directory {directory} does not exist")
        return
        
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                update_imports_in_file(file_path)

if __name__ == "__main__":
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Current directory: {current_dir}")
    
    # Build the routers directory path
    routers_dir = os.path.join(current_dir, "routers")
    print(f"Updating imports in {routers_dir}...")
    update_imports_in_directory(routers_dir)
    print("Done updating imports")