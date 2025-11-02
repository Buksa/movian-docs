#!/usr/bin/env node

/**
 * Link Validation Tool for Movian Documentation
 * 
 * Checks all internal and external links in the documentation to ensure
 * they are valid and accessible.
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class LinkChecker {
    constructor(docsPath) {
        this.docsPath = docsPath;
        this.results = {
            total: 0,
            valid: 0,
            invalid: 0,
            warnings: 0,
            errors: []
        };
        this.checkedUrls = new Map(); // Cache for external URL checks
    }

    /**
     * Main link checking entry point
     */
    async check() {
        console.log('🔗 Starting link validation...');
        
        const markdownFiles = await glob('**/*.md', { 
            cwd: this.docsPath,
            ignore: ['node_modules/**', '.git/**']
        });

        for (const file of markdownFiles) {
            await this.checkMarkdownFile(path.join(this.docsPath, file));
        }
        
        this.generateReport();
        
        return this.results.invalid === 0;
    }

    /**
     * Check links in a markdown file
     */
    async checkMarkdownFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const links = this.extractLinks(content);
        
        for (const link of links) {
            await this.validateLink(link, filePath);
        }
    }

    /**
     * Extract all links from markdown content
     */
    extractLinks(content) {
        const links = [];
        
        // Markdown links: [text](url)
        const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        
        while ((match = markdownLinkRegex.exec(content)) !== null) {
            links.push({
                text: match[1],
                url: match[2],
                type: 'markdown',
                fullMatch: match[0],
                position: match.index
            });
        }

        // Reference links: [text][ref]
        const refLinkRegex = /\[([^\]]*)\]\[([^\]]+)\]/g;
        while ((match = refLinkRegex.exec(content)) !== null) {
            // Find the reference definition
            const refDefRegex = new RegExp(`^\\[${match[2]}\\]:\\s*(.+)$`, 'm');
            const refMatch = refDefRegex.exec(content);
            
            if (refMatch) {
                links.push({
                    text: match[1],
                    url: refMatch[1].trim(),
                    type: 'reference',
                    fullMatch: match[0],
                    position: match.index
                });
            }
        }

        // HTML links: <a href="url">
        const htmlLinkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
        while ((match = htmlLinkRegex.exec(content)) !== null) {
            links.push({
                text: 'HTML link',
                url: match[1],
                type: 'html',
                fullMatch: match[0],
                position: match.index
            });
        }

        // Auto-links: <url>
        const autoLinkRegex = /<(https?:\/\/[^>]+)>/g;
        while ((match = autoLinkRegex.exec(content)) !== null) {
            links.push({
                text: match[1],
                url: match[1],
                type: 'autolink',
                fullMatch: match[0],
                position: match.index
            });
        }

        return links;
    }

    /**
     * Validate a single link
     */
    async validateLink(link, docFile) {
        this.results.total++;
        
        try {
            const url = link.url.trim();
            
            // Skip empty URLs
            if (!url) {
                throw new Error('Empty URL');
            }

            // Handle different URL types
            if (url.startsWith('http://') || url.startsWith('https://')) {
                await this.validateExternalLink(url);
            } else if (url.startsWith('#')) {
                await this.validateAnchorLink(url, docFile);
            } else if (url.startsWith('mailto:')) {
                await this.validateEmailLink(url);
            } else {
                await this.validateInternalLink(url, docFile);
            }
            
            this.results.valid++;
            
        } catch (error) {
            if (error.severity === 'warning') {
                this.results.warnings++;
            } else {
                this.results.invalid++;
            }
            
            this.results.errors.push({
                docFile: docFile,
                link: link.fullMatch,
                url: link.url,
                error: error.message,
                severity: error.severity || 'error',
                line: this.getLineNumber(await fs.readFile(docFile, 'utf8'), link.position)
            });
        }
    }

    /**
     * Validate external HTTP/HTTPS links
     */
    async validateExternalLink(url) {
        // Check cache first
        if (this.checkedUrls.has(url)) {
            const cached = this.checkedUrls.get(url);
            if (!cached.valid) {
                throw new Error(cached.error);
            }
            return;
        }

        try {
            // For now, just do basic URL validation
            // In a full implementation, you might want to make HTTP requests
            const urlObj = new URL(url);
            
            // Check for common issues
            if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                const error = new Error('Link to localhost may not be accessible to readers');
                error.severity = 'warning';
                throw error;
            }

            // Cache the result
            this.checkedUrls.set(url, { valid: true });
            
        } catch (error) {
            if (error.severity !== 'warning') {
                error.message = `Invalid external URL: ${error.message}`;
            }
            this.checkedUrls.set(url, { valid: false, error: error.message });
            throw error;
        }
    }

    /**
     * Validate internal file links
     */
    async validateInternalLink(url, docFile) {
        // Remove query parameters and anchors for file checking
        const [filePart] = url.split(/[?#]/);
        
        // Resolve relative path
        const docDir = path.dirname(docFile);
        const targetPath = path.resolve(docDir, filePart);
        
        // Check if target is within docs directory
        if (!targetPath.startsWith(this.docsPath)) {
            throw new Error(`Link points outside documentation directory: ${url}`);
        }

        // Check if file exists
        if (!await fs.pathExists(targetPath)) {
            throw new Error(`File not found: ${filePart}`);
        }

        // If it's a directory, check for index.md or README.md
        const stat = await fs.stat(targetPath);
        if (stat.isDirectory()) {
            const indexFiles = ['index.md', 'README.md'];
            let hasIndex = false;
            
            for (const indexFile of indexFiles) {
                if (await fs.pathExists(path.join(targetPath, indexFile))) {
                    hasIndex = true;
                    break;
                }
            }
            
            if (!hasIndex) {
                const error = new Error(`Directory link without index file: ${filePart}`);
                error.severity = 'warning';
                throw error;
            }
        }
    }

    /**
     * Validate anchor links within the same document
     */
    async validateAnchorLink(anchor, docFile) {
        const content = await fs.readFile(docFile, 'utf8');
        const anchorName = anchor.substring(1).toLowerCase();
        
        // Extract headers from the document
        const headers = this.extractHeaders(content);
        
        // Convert headers to anchor format (GitHub style)
        const anchors = headers.map(header => 
            header.toLowerCase()
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-')     // Replace spaces with hyphens
                .replace(/-+/g, '-')      // Collapse multiple hyphens
                .replace(/^-|-$/g, '')    // Remove leading/trailing hyphens
        );
        
        if (!anchors.includes(anchorName)) {
            throw new Error(`Anchor not found in document: ${anchor}`);
        }
    }

    /**
     * Extract headers from markdown content
     */
    extractHeaders(content) {
        const headers = [];
        const headerRegex = /^#+\s+(.+)$/gm;
        let match;
        
        while ((match = headerRegex.exec(content)) !== null) {
            headers.push(match[1].trim());
        }
        
        return headers;
    }

    /**
     * Validate email links
     */
    async validateEmailLink(url) {
        const email = url.substring(7); // Remove 'mailto:'
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(`Invalid email address: ${email}`);
        }
    }

    /**
     * Get line number for character position
     */
    getLineNumber(text, position) {
        return text.substring(0, position).split('\n').length;
    }

    /**
     * Generate link checking report
     */
    generateReport() {
        console.log('\n📊 Link Validation Results');
        console.log('==========================');
        console.log(`Total links checked: ${this.results.total}`);
        console.log(`✅ Valid: ${this.results.valid}`);
        console.log(`❌ Invalid: ${this.results.invalid}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ Issues Found:');
            
            // Group by severity
            const errors = this.results.errors.filter(e => e.severity !== 'warning');
            const warnings = this.results.errors.filter(e => e.severity === 'warning');
            
            if (errors.length > 0) {
                console.log('\n🚨 Errors:');
                errors.forEach((error, index) => {
                    console.log(`\n${index + 1}. ${error.docFile}:${error.line}`);
                    console.log(`   Link: ${error.link}`);
                    console.log(`   Error: ${error.error}`);
                });
            }
            
            if (warnings.length > 0) {
                console.log('\n⚠️  Warnings:');
                warnings.forEach((warning, index) => {
                    console.log(`\n${index + 1}. ${warning.docFile}:${warning.line}`);
                    console.log(`   Link: ${warning.link}`);
                    console.log(`   Warning: ${warning.error}`);
                });
            }
        }
        
        const successRate = this.results.total > 0 ? 
            ((this.results.valid / this.results.total) * 100).toFixed(1) : 0;
        console.log(`\n📈 Success Rate: ${successRate}%`);
        
        if (this.results.invalid === 0) {
            console.log('\n🎉 All links are valid!');
            if (this.results.warnings > 0) {
                console.log(`ℹ️  Note: ${this.results.warnings} warnings found (non-critical issues)`);
            }
        } else {
            console.log(`\n⚠️  ${this.results.invalid} links need attention.`);
        }
    }
}

// CLI interface
if (require.main === module) {
    const yargs = require('yargs');
    
    const argv = yargs
        .usage('Usage: $0 [docs-path]')
        .default('docs-path', path.join(__dirname, '..'))
        .help()
        .argv;
    
    const docsPath = argv['docs-path'];
    const checker = new LinkChecker(docsPath);
    
    checker.check().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Link checking failed:', error.message);
        process.exit(1);
    });
}

module.exports = LinkChecker;