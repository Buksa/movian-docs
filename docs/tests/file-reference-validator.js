#!/usr/bin/env node

/**
 * File Reference Validator
 * 
 * Validates file references and line numbers in documentation to ensure
 * they point to existing files and valid line ranges.
 */

const fs = require('fs');
const path = require('path');

class FileReferenceValidator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.docsRoot = options.docsRoot || path.join(__dirname, '..');
    this.movianRoot = options.movianRoot || path.join(__dirname, '../../../../movian');
    this.results = {
      totalReferences: 0,
      validReferences: 0,
      invalidReferences: 0,
      warnings: 0,
      errors: []
    };
  }

  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  error(message) {
    console.error(`❌ ${message}`);
    this.results.errors.push(message);
  }

  warn(message) {
    console.warn(`⚠️  ${message}`);
    this.results.warnings++;
  }

  success(message) {
    if (this.verbose) {
      console.log(`✓ ${message}`);
    }
  }

  /**
   * Extract file references from markdown content
   * Patterns:
   * - `src/path/to/file.c`
   * - `movian/src/path/to/file.c`
   * - Source Reference: src/path/to/file.c:123-456
   * - See: src/path/to/file.c
   */
  extractFileReferences(content, filePath) {
    const references = [];
    
    // Pattern 1: Source Reference with line numbers
    const sourceRefPattern = /Source Reference:\s*([^\s:]+(?:\.c|\.h|\.js|\.view))(?::(\d+)(?:-(\d+))?)?/gi;
    let match;
    
    while ((match = sourceRefPattern.exec(content)) !== null) {
      references.push({
        file: match[1],
        startLine: match[2] ? parseInt(match[2]) : null,
        endLine: match[3] ? parseInt(match[3]) : null,
        context: match[0],
        location: filePath
      });
    }
    
    // Pattern 2: Code blocks with file paths
    const codeBlockPattern = /```[a-z]*\n\/\/ ([^\n]+(?:\.c|\.h|\.js|\.view))/gi;
    while ((match = codeBlockPattern.exec(content)) !== null) {
      references.push({
        file: match[1],
        startLine: null,
        endLine: null,
        context: match[0],
        location: filePath
      });
    }
    
    // Pattern 3: Inline code references
    const inlinePattern = /`((?:src|movian\/src|res\/ecmascript|glwskins)\/[^`]+(?:\.c|\.h|\.js|\.view))`/gi;
    while ((match = inlinePattern.exec(content)) !== null) {
      references.push({
        file: match[1],
        startLine: null,
        endLine: null,
        context: match[0],
        location: filePath
      });
    }
    
    return references;
  }

  /**
   * Validate a single file reference
   */
  validateReference(ref) {
    this.results.totalReferences++;
    
    // Normalize file path
    let filePath = ref.file;
    if (filePath.startsWith('movian/')) {
      filePath = filePath.substring(7);
    }
    
    // Try to find the file in movian repository
    const fullPath = path.join(this.movianRoot, filePath);
    
    if (!fs.existsSync(fullPath)) {
      this.error(`Invalid file reference in ${ref.location}: ${ref.file} (file not found)`);
      this.results.invalidReferences++;
      return false;
    }
    
    // If line numbers are specified, validate them
    if (ref.startLine !== null) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        const totalLines = lines.length;
        
        if (ref.startLine > totalLines) {
          this.error(`Invalid line reference in ${ref.location}: ${ref.file}:${ref.startLine} (file has only ${totalLines} lines)`);
          this.results.invalidReferences++;
          return false;
        }
        
        if (ref.endLine && ref.endLine > totalLines) {
          this.error(`Invalid line range in ${ref.location}: ${ref.file}:${ref.startLine}-${ref.endLine} (file has only ${totalLines} lines)`);
          this.results.invalidReferences++;
          return false;
        }
        
        this.success(`Valid reference: ${ref.file}:${ref.startLine}${ref.endLine ? '-' + ref.endLine : ''}`);
      } catch (err) {
        this.warn(`Could not read file ${fullPath}: ${err.message}`);
        this.results.warnings++;
      }
    } else {
      this.success(`Valid file reference: ${ref.file}`);
    }
    
    this.results.validReferences++;
    return true;
  }

  /**
   * Scan all markdown files in documentation
   */
  scanDocumentation() {
    const markdownFiles = this.findMarkdownFiles(this.docsRoot);
    
    console.log(`\n📄 Scanning ${markdownFiles.length} documentation files for file references...\n`);
    
    for (const file of markdownFiles) {
      this.log(`Scanning: ${path.relative(this.docsRoot, file)}`);
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const references = this.extractFileReferences(content, path.relative(this.docsRoot, file));
        
        for (const ref of references) {
          this.validateReference(ref);
        }
      } catch (err) {
        this.error(`Error reading ${file}: ${err.message}`);
      }
    }
  }

  /**
   * Find all markdown files recursively
   */
  findMarkdownFiles(dir, files = []) {
    if (!fs.existsSync(dir)) {
      return files;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this.findMarkdownFiles(fullPath, files);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('FILE REFERENCE VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`Total References Found: ${this.results.totalReferences}`);
    console.log(`Valid References: ${this.results.validReferences}`);
    console.log(`Invalid References: ${this.results.invalidReferences}`);
    console.log(`Warnings: ${this.results.warnings}`);
    console.log('='.repeat(60));
    
    if (this.results.invalidReferences === 0 && this.results.warnings === 0) {
      console.log('✅ All file references are valid!');
      return true;
    } else if (this.results.invalidReferences === 0) {
      console.log('⚠️  All references valid but some warnings were issued');
      return true;
    } else {
      console.log('❌ Some file references are invalid');
      return false;
    }
  }

  /**
   * Save results to JSON
   */
  saveResults(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalReferences: this.results.totalReferences,
        validReferences: this.results.validReferences,
        invalidReferences: this.results.invalidReferences,
        warnings: this.results.warnings
      },
      errors: this.results.errors
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Results saved to: ${outputPath}`);
  }

  /**
   * Run validation
   */
  run() {
    console.log('🔍 File Reference Validator');
    console.log(`Documentation Root: ${this.docsRoot}`);
    console.log(`Movian Source Root: ${this.movianRoot}`);
    
    if (!fs.existsSync(this.movianRoot)) {
      console.error(`\n❌ Movian source directory not found: ${this.movianRoot}`);
      console.error('Please ensure the Movian repository is cloned at the expected location.');
      process.exit(1);
    }
    
    this.scanDocumentation();
    const success = this.generateReport();
    
    // Save results
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    this.saveResults(path.join(resultsDir, 'file-reference-validation.json'));
    
    return success ? 0 : 1;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    docsRoot: args.find(arg => arg.startsWith('--docs-root='))?.split('=')[1],
    movianRoot: args.find(arg => arg.startsWith('--movian-root='))?.split('=')[1]
  };
  
  const validator = new FileReferenceValidator(options);
  const exitCode = validator.run();
  process.exit(exitCode);
}

module.exports = FileReferenceValidator;
