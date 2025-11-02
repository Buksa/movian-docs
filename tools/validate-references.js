#!/usr/bin/env node

/**
 * Source Reference Validation Tool for Movian Documentation
 * 
 * Validates that all source code references in the documentation point to
 * valid files and line numbers in the Movian source code.
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class ReferenceValidator {
    constructor(docsPath, movianSourcePath) {
        this.docsPath = docsPath;
        this.movianSourcePath = movianSourcePath;
        this.results = {
            total: 0,
            valid: 0,
            invalid: 0,
            errors: []
        };
    }

    /**
     * Main validation entry point
     */
    async validate() {
        console.log('🔗 Starting source reference validation...');
        
        if (!await this.validateMovianSource()) {
            console.error('❌ Invalid Movian source path:', this.movianSourcePath);
            return false;
        }

        const markdownFiles = await glob('**/*.md', { 
            cwd: this.docsPath,
            ignore: ['node_modules/**', '.git/**']
        });

        for (const file of markdownFiles) {
            await this.validateMarkdownFile(path.join(this.docsPath, file));
        }
        
        this.generateReport();
        
        return this.results.invalid === 0;
    }

    /**
     * Validate Movian source path exists
     */
    async validateMovianSource() {
        if (!this.movianSourcePath) {
            console.log('ℹ️  No Movian source path provided, skipping reference validation');
            return false;
        }

        const requiredFiles = ['src/main.c', 'Makefile'];
        for (const file of requiredFiles) {
            const fullPath = path.join(this.movianSourcePath, file);
            if (!await fs.pathExists(fullPath)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Validate references in a markdown file
     */
    async validateMarkdownFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const references = this.extractSourceReferences(content);
        
        for (const ref of references) {
            await this.validateReference(ref, filePath);
        }
    }

    /**
     * Extract source code references from markdown content
     */
    extractSourceReferences(content) {
        const references = [];
        
        // Pattern: src/path/file.c:123-456
        const fileLineRegex = /(src\/[^:\s]+\.[ch])(?::(\d+)(?:-(\d+))?)?/g;
        let match;
        
        while ((match = fileLineRegex.exec(content)) !== null) {
            references.push({
                file: match[1],
                startLine: match[2] ? parseInt(match[2]) : null,
                endLine: match[3] ? parseInt(match[3]) : null,
                fullMatch: match[0],
                position: match.index
            });
        }

        // Pattern: res/ecmascript/modules/file.js
        const jsFileRegex = /(res\/ecmascript\/[^:\s]+\.js)(?::(\d+)(?:-(\d+))?)?/g;
        while ((match = jsFileRegex.exec(content)) !== null) {
            references.push({
                file: match[1],
                startLine: match[2] ? parseInt(match[2]) : null,
                endLine: match[3] ? parseInt(match[3]) : null,
                fullMatch: match[0],
                position: match.index
            });
        }

        // Pattern: glwskins/flat/file.view
        const viewFileRegex = /(glwskins\/[^:\s]+\.view)(?::(\d+)(?:-(\d+))?)?/g;
        while ((match = viewFileRegex.exec(content)) !== null) {
            references.push({
                file: match[1],
                startLine: match[2] ? parseInt(match[2]) : null,
                endLine: match[3] ? parseInt(match[3]) : null,
                fullMatch: match[0],
                position: match.index
            });
        }

        return references;
    }

    /**
     * Validate a single source reference
     */
    async validateReference(ref, docFile) {
        this.results.total++;
        
        try {
            const sourcePath = path.join(this.movianSourcePath, ref.file);
            
            // Check if file exists
            if (!await fs.pathExists(sourcePath)) {
                throw new Error(`File does not exist: ${ref.file}`);
            }

            // If line numbers are specified, validate them
            if (ref.startLine !== null) {
                const content = await fs.readFile(sourcePath, 'utf8');
                const lines = content.split('\n');
                
                if (ref.startLine > lines.length) {
                    throw new Error(`Start line ${ref.startLine} exceeds file length (${lines.length} lines)`);
                }
                
                if (ref.endLine && ref.endLine > lines.length) {
                    throw new Error(`End line ${ref.endLine} exceeds file length (${lines.length} lines)`);
                }
                
                if (ref.endLine && ref.startLine > ref.endLine) {
                    throw new Error(`Start line ${ref.startLine} is greater than end line ${ref.endLine}`);
                }
            }
            
            this.results.valid++;
            
        } catch (error) {
            this.results.invalid++;
            this.results.errors.push({
                docFile: docFile,
                reference: ref.fullMatch,
                file: ref.file,
                error: error.message,
                line: this.getLineNumber(await fs.readFile(docFile, 'utf8'), ref.position)
            });
        }
    }

    /**
     * Get line number for character position
     */
    getLineNumber(text, position) {
        return text.substring(0, position).split('\n').length;
    }

    /**
     * Generate validation report
     */
    generateReport() {
        console.log('\n📊 Source Reference Validation Results');
        console.log('======================================');
        console.log(`Total references checked: ${this.results.total}`);
        console.log(`✅ Valid: ${this.results.valid}`);
        console.log(`❌ Invalid: ${this.results.invalid}`);
        
        if (this.results.invalid > 0) {
            console.log('\n❌ Invalid References:');
            this.results.errors.forEach((error, index) => {
                console.log(`\n${index + 1}. ${error.docFile}:${error.line}`);
                console.log(`   Reference: ${error.reference}`);
                console.log(`   Error: ${error.error}`);
            });
        }
        
        const successRate = this.results.total > 0 ? 
            ((this.results.valid / this.results.total) * 100).toFixed(1) : 0;
        console.log(`\n📈 Success Rate: ${successRate}%`);
        
        if (this.results.invalid === 0) {
            console.log('\n🎉 All source references are valid!');
        } else {
            console.log(`\n⚠️  ${this.results.invalid} references need attention.`);
        }
    }
}

// CLI interface
if (require.main === module) {
    const yargs = require('yargs');
    
    const argv = yargs
        .usage('Usage: $0 [options]')
        .option('docs-path', {
            alias: 'd',
            describe: 'Path to documentation directory',
            default: path.join(__dirname, '..')
        })
        .option('movian-source', {
            alias: 's',
            describe: 'Path to Movian source code directory',
            type: 'string'
        })
        .help()
        .argv;
    
    const validator = new ReferenceValidator(argv['docs-path'], argv['movian-source']);
    
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    });
}

module.exports = ReferenceValidator;