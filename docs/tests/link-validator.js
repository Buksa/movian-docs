#!/usr/bin/env node

/**
 * Link Validator
 * 
 * Validates internal and external links in documentation to ensure
 * they point to existing resources.
 */

const fs = require('fs');
const path = require('path');

class LinkValidator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.docsRoot = options.docsRoot || path.join(__dirname, '..');
    this.checkExternal = options.checkExternal || false;
    this.results = {
      totalLinks: 0,
      validLinks: 0,
      invalidLinks: 0,
      externalLinks: 0,
      warnings: 0,
      errors: [],
      brokenLinks: []
    };
  }

  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  error(message, link) {
    console.error(`❌ ${message}`);
    this.results.errors.push(message);
    if (link) {
      this.results.brokenLinks.push(link);
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
   * Extract links from markdown content
   */
  extractLinks(content, filePath) {
    const links = [];
    
    // Pattern 1: Markdown links [text](url)
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = markdownLinkPattern.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        type: this.getLinkType(match[2]),
        location: filePath,
        line: this.getLineNumber(content, match.index)
      });
    }
    
    // Pattern 2: Reference-style links [text][ref]
    const refLinkPattern = /\[([^\]]+)\]\[([^\]]+)\]/g;
    while ((match = refLinkPattern.exec(content)) !== null) {
      // Find the reference definition
      const refPattern = new RegExp(`\\[${match[2]}\\]:\\s*(.+)`, 'i');
      const refMatch = content.match(refPattern);
      if (refMatch) {
        links.push({
          text: match[1],
          url: refMatch[1].trim(),
          type: this.getLinkType(refMatch[1].trim()),
          location: filePath,
          line: this.getLineNumber(content, match.index)
        });
      }
    }
    
    // Pattern 3: HTML links <a href="url">
    const htmlLinkPattern = /<a\s+href=["']([^"']+)["']/gi;
    while ((match = htmlLinkPattern.exec(content)) !== null) {
      links.push({
        text: 'HTML link',
        url: match[1],
        type: this.getLinkType(match[1]),
        location: filePath,
        line: this.getLineNumber(content, match.index)
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
    } else if (url.startsWith('mailto:')) {
      return 'email';
    } else {
      return 'internal';
    }
  }

  /**
   * Get line number for a position in content
   */
  getLineNumber(content, position) {
    return content.substring(0, position).split('\n').length;
  }

  /**
   * Validate internal link
   */
  validateInternalLink(link, sourceFile) {
    const url = link.url.split('#')[0]; // Remove anchor
    const anchor = link.url.includes('#') ? link.url.split('#')[1] : null;
    
    if (!url) {
      // Just an anchor in the same file
      if (anchor) {
        return this.validateAnchor(anchor, sourceFile, link);
      }
      return true;
    }
    
    // Resolve relative path
    const sourceDir = path.dirname(sourceFile);
    const targetPath = path.resolve(sourceDir, url);
    
    if (!fs.existsSync(targetPath)) {
      this.error(
        `Broken internal link in ${link.location}:${link.line}: ${link.url}`,
        link
      );
      this.results.invalidLinks++;
      return false;
    }
    
    // If there's an anchor, validate it
    if (anchor) {
      return this.validateAnchor(anchor, targetPath, link);
    }
    
    this.success(`Valid internal link: ${link.url}`);
    this.results.validLinks++;
    return true;
  }

  /**
   * Validate anchor exists in target file
   */
  validateAnchor(anchor, targetFile, link) {
    try {
      const content = fs.readFileSync(targetFile, 'utf8');
      
      // Check for markdown headers that would create this anchor
      const anchorPattern = new RegExp(`^#+\\s+.*${anchor.replace(/-/g, '[ -]')}`, 'im');
      
      // Also check for explicit HTML anchors
      const htmlAnchorPattern = new RegExp(`<a\\s+(?:name|id)=["']${anchor}["']`, 'i');
      
      if (anchorPattern.test(content) || htmlAnchorPattern.test(content)) {
        this.success(`Valid anchor: #${anchor}`);
        this.results.validLinks++;
        return true;
      } else {
        this.warn(`Anchor not found in ${link.location}:${link.line}: #${anchor}`);
        this.results.warnings++;
        return false;
      }
    } catch (err) {
      this.warn(`Could not validate anchor in ${targetFile}: ${err.message}`);
      this.results.warnings++;
      return false;
    }
  }

  /**
   * Validate external link (basic check)
   */
  validateExternalLink(link) {
    // For now, just check if it's a well-formed URL
    try {
      new URL(link.url);
      this.success(`Valid external link: ${link.url}`);
      this.results.validLinks++;
      this.results.externalLinks++;
      return true;
    } catch (err) {
      this.error(
        `Malformed external link in ${link.location}:${link.line}: ${link.url}`,
        link
      );
      this.results.invalidLinks++;
      return false;
    }
  }

  /**
   * Validate a single link
   */
  validateLink(link, sourceFile) {
    this.results.totalLinks++;
    
    switch (link.type) {
      case 'internal':
        return this.validateInternalLink(link, sourceFile);
      case 'anchor':
        return this.validateAnchor(link.url.substring(1), sourceFile, link);
      case 'external':
        return this.validateExternalLink(link);
      case 'email':
        // Email links are generally fine
        this.results.validLinks++;
        return true;
      default:
        this.warn(`Unknown link type: ${link.type} in ${link.location}`);
        this.results.warnings++;
        return false;
    }
  }

  /**
   * Scan all markdown files in documentation
   */
  scanDocumentation() {
    const markdownFiles = this.findMarkdownFiles(this.docsRoot);
    
    console.log(`\n📄 Scanning ${markdownFiles.length} documentation files for links...\n`);
    
    for (const file of markdownFiles) {
      this.log(`Scanning: ${path.relative(this.docsRoot, file)}`);
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const links = this.extractLinks(content, path.relative(this.docsRoot, file));
        
        for (const link of links) {
          this.validateLink(link, file);
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
    console.log('LINK VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Links Found: ${this.results.totalLinks}`);
    console.log(`Valid Links: ${this.results.validLinks}`);
    console.log(`Invalid Links: ${this.results.invalidLinks}`);
    console.log(`External Links: ${this.results.externalLinks}`);
    console.log(`Warnings: ${this.results.warnings}`);
    console.log('='.repeat(60));
    
    if (this.results.brokenLinks.length > 0) {
      console.log('\n❌ Broken Links:');
      for (const link of this.results.brokenLinks) {
        console.log(`  - ${link.location}:${link.line} -> ${link.url}`);
      }
    }
    
    if (this.results.invalidLinks === 0 && this.results.warnings === 0) {
      console.log('✅ All links are valid!');
      return true;
    } else if (this.results.invalidLinks === 0) {
      console.log('⚠️  All links valid but some warnings were issued');
      return true;
    } else {
      console.log('❌ Some links are broken');
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
        totalLinks: this.results.totalLinks,
        validLinks: this.results.validLinks,
        invalidLinks: this.results.invalidLinks,
        externalLinks: this.results.externalLinks,
        warnings: this.results.warnings
      },
      brokenLinks: this.results.brokenLinks,
      errors: this.results.errors
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Results saved to: ${outputPath}`);
  }

  /**
   * Run validation
   */
  run() {
    console.log('🔗 Link Validator');
    console.log(`Documentation Root: ${this.docsRoot}`);
    
    this.scanDocumentation();
    const success = this.generateReport();
    
    // Save results
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    this.saveResults(path.join(resultsDir, 'link-validation.json'));
    
    return success ? 0 : 1;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    checkExternal: args.includes('--check-external'),
    docsRoot: args.find(arg => arg.startsWith('--docs-root='))?.split('=')[1]
  };
  
  const validator = new LinkValidator(options);
  const exitCode = validator.run();
  process.exit(exitCode);
}

module.exports = LinkValidator;
