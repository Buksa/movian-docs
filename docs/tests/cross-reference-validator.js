#!/usr/bin/env node

/**
 * Cross-Reference Validator
 * 
 * Validates cross-references between related documentation sections
 * to ensure consistency and completeness.
 */

const fs = require('fs');
const path = require('path');

class CrossReferenceValidator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.docsRoot = options.docsRoot || path.join(__dirname, '..');
    this.results = {
      totalChecks: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: [],
      missingReferences: []
    };
    
    // Define expected cross-references
    this.expectedReferences = {
      'plugins/api/core-api.md': [
        'plugins/architecture.md',
        'plugins/lifecycle.md',
        'reference/glossary.md'
      ],
      'plugins/api/http-api.md': [
        'plugins/best-practices.md',
        'reference/glossary.md'
      ],
      'ui/view-files/syntax-reference.md': [
        'ui/view-files/elements-reference.md',
        'ui/view-files/attributes-reference.md',
        'reference/glossary.md'
      ],
      'ui/widgets/container.md': [
        'ui/view-files/syntax-reference.md',
        'ui/examples/basic-layout.view'
      ],
      'media/osd-system.md': [
        'ui/theming/macro-reference.md',
        'ui/theming/global-configuration.md'
      ]
    };
  }

  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  error(message, ref) {
    console.error(`❌ ${message}`);
    this.results.errors.push(message);
    if (ref) {
      this.results.missingReferences.push(ref);
    }
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
   * Check if a file references another file
   */
  fileReferencesTarget(sourceFile, targetFile) {
    try {
      const content = fs.readFileSync(sourceFile, 'utf8');
      const targetName = path.basename(targetFile);
      const targetPath = targetFile.replace(/\\/g, '/');
      
      // Check for various reference patterns
      const patterns = [
        new RegExp(targetPath.replace(/\//g, '\\/'), 'i'),
        new RegExp(targetName.replace(/\./g, '\\.'), 'i'),
        new RegExp(`\\[.*\\]\\([^)]*${targetName.replace(/\./g, '\\.')}`, 'i')
      ];
      
      return patterns.some(pattern => pattern.test(content));
    } catch (err) {
      this.warn(`Could not read ${sourceFile}: ${err.message}`);
      return false;
    }
  }

  /**
   * Validate expected cross-references
   */
  validateExpectedReferences() {
    console.log('\n📋 Validating expected cross-references...\n');
    
    for (const [sourceFile, expectedTargets] of Object.entries(this.expectedReferences)) {
      const sourcePath = path.join(this.docsRoot, sourceFile);
      
      if (!fs.existsSync(sourcePath)) {
        this.warn(`Source file not found: ${sourceFile}`);
        continue;
      }
      
      this.log(`Checking references in: ${sourceFile}`);
      
      for (const targetFile of expectedTargets) {
        this.results.totalChecks++;
        const targetPath = path.join(this.docsRoot, targetFile);
        
        if (!fs.existsSync(targetPath)) {
          this.warn(`Target file not found: ${targetFile}`);
          this.results.warnings++;
          continue;
        }
        
        if (this.fileReferencesTarget(sourcePath, targetFile)) {
          this.success(`${sourceFile} references ${targetFile}`);
          this.results.passed++;
        } else {
          this.error(
            `Missing cross-reference: ${sourceFile} should reference ${targetFile}`,
            { source: sourceFile, target: targetFile }
          );
          this.results.failed++;
        }
      }
    }
  }

  /**
   * Check for orphaned files (files not referenced by any other file)
   */
  findOrphanedFiles() {
    console.log('\n🔍 Checking for orphaned documentation files...\n');
    
    const allFiles = this.findMarkdownFiles(this.docsRoot);
    const referencedFiles = new Set();
    
    // Build a map of all references
    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const links = this.extractLinks(content);
        
        for (const link of links) {
          if (link.type === 'internal') {
            const targetPath = path.resolve(path.dirname(file), link.url.split('#')[0]);
            if (fs.existsSync(targetPath)) {
              referencedFiles.add(targetPath);
            }
          }
        }
      } catch (err) {
        this.warn(`Error reading ${file}: ${err.message}`);
      }
    }
    
    // Find orphaned files (excluding index files and README files)
    const orphanedFiles = [];
    for (const file of allFiles) {
      const basename = path.basename(file);
      if (basename === 'index.md' || basename === 'README.md') {
        continue; // Skip index and README files
      }
      
      if (!referencedFiles.has(file)) {
        orphanedFiles.push(path.relative(this.docsRoot, file));
      }
    }
    
    if (orphanedFiles.length > 0) {
      console.log('⚠️  Potentially orphaned files (not referenced by other docs):');
      for (const file of orphanedFiles) {
        console.log(`  - ${file}`);
        this.results.warnings++;
      }
    } else {
      console.log('✅ No orphaned files found');
    }
    
    return orphanedFiles;
  }

  /**
   * Extract links from content
   */
  extractLinks(content) {
    const links = [];
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = markdownLinkPattern.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        type: this.getLinkType(match[2])
      });
    }
    
    return links;
  }

  /**
   * Determine link type
   */
  getLinkType(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return 'external';
    } else if (url.startsWith('#')) {
      return 'anchor';
    } else {
      return 'internal';
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
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'tests') {
          this.findMarkdownFiles(fullPath, files);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Validate API documentation completeness
   */
  validateAPICompleteness() {
    console.log('\n🔧 Validating API documentation completeness...\n');
    
    const apiFiles = [
      'plugins/api/core-api.md',
      'plugins/api/http-api.md',
      'plugins/api/storage-api.md',
      'plugins/api/settings-api.md'
    ];
    
    const requiredSections = [
      'Overview',
      'Methods',
      'Examples',
      'Error Handling'
    ];
    
    for (const apiFile of apiFiles) {
      const filePath = path.join(this.docsRoot, apiFile);
      
      if (!fs.existsSync(filePath)) {
        this.warn(`API file not found: ${apiFile}`);
        continue;
      }
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        this.log(`Checking API completeness: ${apiFile}`);
        
        for (const section of requiredSections) {
          this.results.totalChecks++;
          const sectionPattern = new RegExp(`^#+\\s+${section}`, 'im');
          
          if (sectionPattern.test(content)) {
            this.success(`${apiFile} has ${section} section`);
            this.results.passed++;
          } else {
            this.warn(`${apiFile} missing ${section} section`);
            this.results.warnings++;
          }
        }
      } catch (err) {
        this.error(`Error reading ${apiFile}: ${err.message}`);
      }
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('CROSS-REFERENCE VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Checks: ${this.results.totalChecks}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Warnings: ${this.results.warnings}`);
    console.log('='.repeat(60));
    
    if (this.results.missingReferences.length > 0) {
      console.log('\n❌ Missing Cross-References:');
      for (const ref of this.results.missingReferences) {
        console.log(`  - ${ref.source} -> ${ref.target}`);
      }
    }
    
    if (this.results.failed === 0 && this.results.warnings === 0) {
      console.log('✅ All cross-references are valid!');
      return true;
    } else if (this.results.failed === 0) {
      console.log('⚠️  Cross-references valid but some warnings were issued');
      return true;
    } else {
      console.log('❌ Some cross-references are missing');
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
        totalChecks: this.results.totalChecks,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings
      },
      missingReferences: this.results.missingReferences,
      errors: this.results.errors
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Results saved to: ${outputPath}`);
  }

  /**
   * Run validation
   */
  run() {
    console.log('🔗 Cross-Reference Validator');
    console.log(`Documentation Root: ${this.docsRoot}`);
    
    this.validateExpectedReferences();
    this.validateAPICompleteness();
    this.findOrphanedFiles();
    
    const success = this.generateReport();
    
    // Save results
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    this.saveResults(path.join(resultsDir, 'cross-reference-validation.json'));
    
    return success ? 0 : 1;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    docsRoot: args.find(arg => arg.startsWith('--docs-root='))?.split('=')[1]
  };
  
  const validator = new CrossReferenceValidator(options);
  const exitCode = validator.run();
  process.exit(exitCode);
}

module.exports = CrossReferenceValidator;
