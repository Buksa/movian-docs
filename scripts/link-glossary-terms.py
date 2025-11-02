#!/usr/bin/env python3
"""
Glossary Term Linking Script

This script automatically creates links to glossary terms throughout the documentation.
It scans markdown files and creates links to the glossary for defined technical terms.

Usage:
    python scripts/link-glossary-terms.py [--dry-run] [--verbose]

Features:
- Identifies technical terms defined in the glossary
- Creates markdown links to glossary anchors
- Avoids linking terms that are already linked
- Preserves existing formatting and links
- Supports case-insensitive matching with proper capitalization
"""

import os
import re
import argparse
from pathlib import Path
from typing import Dict, List, Set, Tuple

class GlossaryLinker:
    def __init__(self, docs_root: Path):
        self.docs_root = docs_root
        self.glossary_path = docs_root / "reference" / "glossary.md"
        self.terms = {}  # term -> (anchor, display_name)
        self.processed_files = set()
        
    def load_glossary_terms(self) -> Dict[str, Tuple[str, str]]:
        """Load technical terms from the glossary file."""
        if not self.glossary_path.exists():
            raise FileNotFoundError(f"Glossary not found at {self.glossary_path}")
            
        terms = {}
        
        with open(self.glossary_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find all term definitions (### Term Name)
        term_pattern = r'^### (.+?)$'
        matches = re.finditer(term_pattern, content, re.MULTILINE)
        
        for match in matches:
            term_name = match.group(1).strip()
            
            # Create anchor from term name
            anchor = self._create_anchor(term_name)
            
            # Store both the full term and common variations
            terms[term_name.lower()] = (anchor, term_name)
            
            # Add common variations
            variations = self._get_term_variations(term_name)
            for variation in variations:
                if variation.lower() not in terms:
                    terms[variation.lower()] = (anchor, term_name)
                    
        return terms
    
    def _create_anchor(self, term_name: str) -> str:
        """Create a URL anchor from a term name."""
        # Convert to lowercase, replace spaces and special chars with hyphens
        anchor = re.sub(r'[^\w\s-]', '', term_name.lower())
        anchor = re.sub(r'[-\s]+', '-', anchor)
        return anchor.strip('-')
    
    def _get_term_variations(self, term_name: str) -> List[str]:
        """Get common variations of a term name."""
        variations = []
        
        # Remove parenthetical parts
        base_term = re.sub(r'\s*\([^)]+\)', '', term_name)
        if base_term != term_name:
            variations.append(base_term)
            
        # Add plural forms
        if not term_name.lower().endswith('s'):
            variations.append(term_name + 's')
            variations.append(base_term + 's')
            
        # Add acronym if present in parentheses
        acronym_match = re.search(r'\(([A-Z]+)\)', term_name)
        if acronym_match:
            variations.append(acronym_match.group(1))
            
        return variations
    
    def should_process_file(self, file_path: Path) -> bool:
        """Determine if a file should be processed for term linking."""
        # Skip the glossary file itself
        if file_path == self.glossary_path:
            return False
            
        # Only process markdown files
        if file_path.suffix != '.md':
            return False
            
        # Skip certain directories
        skip_dirs = {'scripts', 'task-reports', '.git', '.kiro'}
        if any(part in skip_dirs for part in file_path.parts):
            return False
            
        return True
    
    def find_linkable_terms(self, content: str) -> List[Tuple[str, int, int, str, str]]:
        """Find terms in content that should be linked to glossary."""
        linkable_terms = []
        
        # Split content into sections to avoid linking inside code blocks and existing links
        sections = self._split_content_sections(content)
        
        current_pos = 0
        for section_type, section_content in sections:
            if section_type == 'text':
                # Look for terms in regular text sections
                for term_lower, (anchor, display_name) in self.terms.items():
                    # Create pattern for whole word matching
                    pattern = r'\b' + re.escape(term_lower) + r'\b'
                    
                    for match in re.finditer(pattern, section_content, re.IGNORECASE):
                        start_pos = current_pos + match.start()
                        end_pos = current_pos + match.end()
                        matched_text = match.group()
                        
                        linkable_terms.append((
                            matched_text, start_pos, end_pos, anchor, display_name
                        ))
            
            current_pos += len(section_content)
            
        # Sort by position (reverse order for safe replacement)
        linkable_terms.sort(key=lambda x: x[1], reverse=True)
        
        # Remove overlapping matches (keep the first/longest match)
        filtered_terms = []
        used_ranges = set()
        
        for term_data in linkable_terms:
            _, start, end, _, _ = term_data
            range_overlap = any(
                (start < used_end and end > used_start) 
                for used_start, used_end in used_ranges
            )
            
            if not range_overlap:
                filtered_terms.append(term_data)
                used_ranges.add((start, end))
                
        return filtered_terms
    
    def _split_content_sections(self, content: str) -> List[Tuple[str, str]]:
        """Split content into sections: text, code_block, inline_code, link."""
        sections = []
        current_pos = 0
        
        # Patterns for different content types
        patterns = [
            ('code_block', r'```[\s\S]*?```'),
            ('inline_code', r'`[^`]+`'),
            ('link', r'\[([^\]]+)\]\([^)]+\)'),
            ('image', r'!\[([^\]]*)\]\([^)]+\)'),
        ]
        
        # Find all special sections
        special_sections = []
        for section_type, pattern in patterns:
            for match in re.finditer(pattern, content):
                special_sections.append((match.start(), match.end(), section_type))
                
        # Sort by position
        special_sections.sort()
        
        # Build sections list
        for start, end, section_type in special_sections:
            # Add text before this section
            if current_pos < start:
                sections.append(('text', content[current_pos:start]))
            
            # Add the special section
            sections.append((section_type, content[start:end]))
            current_pos = end
            
        # Add remaining text
        if current_pos < len(content):
            sections.append(('text', content[current_pos:]))
            
        return sections
    
    def create_glossary_link(self, term: str, anchor: str, file_path: Path) -> str:
        """Create a markdown link to the glossary term."""
        # Calculate relative path from current file to glossary
        try:
            rel_path = os.path.relpath(self.glossary_path, file_path.parent)
            # Normalize path separators for URLs
            rel_path = rel_path.replace('\\', '/')
            return f"[{term}]({rel_path}#{anchor})"
        except ValueError:
            # Fallback to absolute path if relative path calculation fails
            return f"[{term}](../reference/glossary.md#{anchor})"
    
    def process_file(self, file_path: Path, dry_run: bool = False) -> Tuple[bool, int]:
        """Process a single file to add glossary links."""
        if not self.should_process_file(file_path):
            return False, 0
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
        except UnicodeDecodeError:
            print(f"Warning: Could not read {file_path} (encoding issue)")
            return False, 0
            
        # Find terms to link
        linkable_terms = self.find_linkable_terms(original_content)
        
        if not linkable_terms:
            return False, 0
            
        # Apply links (in reverse order to preserve positions)
        modified_content = original_content
        links_added = 0
        
        for matched_text, start_pos, end_pos, anchor, display_name in linkable_terms:
            # Create the link
            link = self.create_glossary_link(matched_text, anchor, file_path)
            
            # Replace the term with the link
            modified_content = (
                modified_content[:start_pos] + 
                link + 
                modified_content[end_pos:]
            )
            links_added += 1
            
        # Write the modified content
        if not dry_run and modified_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
                
        return True, links_added
    
    def process_all_files(self, dry_run: bool = False, verbose: bool = False) -> Dict[str, int]:
        """Process all markdown files in the documentation."""
        # Load glossary terms
        self.terms = self.load_glossary_terms()
        
        if verbose:
            print(f"Loaded {len(self.terms)} glossary terms")
            
        results = {
            'files_processed': 0,
            'files_modified': 0,
            'total_links_added': 0
        }
        
        # Find all markdown files
        for file_path in self.docs_root.rglob('*.md'):
            if self.should_process_file(file_path):
                was_modified, links_added = self.process_file(file_path, dry_run)
                
                results['files_processed'] += 1
                if was_modified:
                    results['files_modified'] += 1
                    results['total_links_added'] += links_added
                    
                    if verbose:
                        action = "Would modify" if dry_run else "Modified"
                        print(f"{action} {file_path}: {links_added} links added")
                        
        return results

def main():
    parser = argparse.ArgumentParser(description='Add automatic links to glossary terms')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be changed without modifying files')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Show detailed output')
    parser.add_argument('--docs-root', type=Path, 
                       default=Path(__file__).parent.parent / 'docs',
                       help='Root directory of documentation')
    
    args = parser.parse_args()
    
    # Validate docs root
    if not args.docs_root.exists():
        print(f"Error: Documentation root not found: {args.docs_root}")
        return 1
        
    # Create linker and process files
    linker = GlossaryLinker(args.docs_root)
    
    try:
        results = linker.process_all_files(args.dry_run, args.verbose)
        
        # Print summary
        action = "Would process" if args.dry_run else "Processed"
        print(f"\n{action} {results['files_processed']} files")
        print(f"Modified {results['files_modified']} files")
        print(f"Added {results['total_links_added']} glossary links")
        
        if args.dry_run and results['files_modified'] > 0:
            print("\nRun without --dry-run to apply changes")
            
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return 1
    except Exception as e:
        print(f"Unexpected error: {e}")
        return 1
        
    return 0

if __name__ == '__main__':
    exit(main())