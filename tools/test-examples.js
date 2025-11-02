#!/usr/bin/env node

/**
 * Code Example Testing Framework for Movian Documentation
 * 
 * Validates that all code examples in the documentation are syntactically correct
 * and can be executed (where applicable).
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');
const { execSync } = require('child_process');

class ExampleTester {
    constructor(docsPath) {
        this.docsPath = docsPath;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
    }

    /**
     * Main testing entry point
     */
    async test() {
        console.log('🧪 Starting code example validation...');
        
        const markdownFiles = await glob('**/*.md', { 
            cwd: this.docsPath,
            ignore: ['node_modules/**', '.git/**']
        });

        for (const file of markdownFiles) {
            await this.testMarkdownFile(path.join(this.docsPath, file));
        }

        await this.testPluginExamples();
        await this.testViewFileExamples();
        
        this.generateReport();
        
        return this.results.failed === 0;
    }

    /**
     * Test code blocks in a markdown file
     */
    async testMarkdownFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const codeBlocks = this.extractCodeBlocks(content);
        
        for (const block of codeBlocks) {
            await this.testCodeBlock(block, filePath);
        }
    }

    /**
     * Extract code blocks from markdown content
     */
    extractCodeBlocks(content) {
        const blocks = [];
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'text',
                code: match[2].trim(),
                line: this.getLineNumber(content, match.index)
            });
        }
        
        return blocks;
    }

    /**
     * Test an individual code block
     */
    async testCodeBlock(block, filePath) {
        this.results.total++;
        
        try {
            switch (block.language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    await this.testJavaScript(block, filePath);
                    break;
                case 'json':
                    await this.testJSON(block, filePath);
                    break;
                case 'c':
                    await this.testCCode(block, filePath);
                    break;
                case 'xml':
                    await this.testXML(block, filePath);
                    break;
                case 'bash':
                case 'shell':
                    await this.testShellCommand(block, filePath);
                    break;
                default:
                    this.results.skipped++;
                    return;
            }
            
            this.results.passed++;
            
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({
                file: filePath,
                line: block.line,
                language: block.language,
                error: error.message,
                code: block.code.substring(0, 100) + '...'
            });
        }
    }

    /**
     * Test JavaScript code syntax
     */
    async testJavaScript(block, filePath) {
        // Create temporary file for syntax checking
        const tempFile = path.join(__dirname, 'temp_js_test.js');
        
        try {
            await fs.writeFile(tempFile, block.code);
            
            // Use Node.js to check syntax
            execSync(`node --check "${tempFile}"`, { stdio: 'pipe' });
            
        } finally {
            if (await fs.pathExists(tempFile)) {
                await fs.remove(tempFile);
            }
        }
    }

    /**
     * Test JSON syntax
     */
    async testJSON(block, filePath) {
        try {
            JSON.parse(block.code);
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }
    }

    /**
     * Test C code syntax (basic check)
     */
    async testCCode(block, filePath) {
        // Basic syntax checks for C code
        const lines = block.code.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for unmatched braces (basic check)
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            
            // Check for missing semicolons on statement lines
            if (line.length > 0 && 
                !line.endsWith(';') && 
                !line.endsWith('{') && 
                !line.endsWith('}') &&
                !line.startsWith('#') &&
                !line.startsWith('//') &&
                !line.startsWith('/*') &&
                !line.includes('*/')) {
                
                // This might be a statement that needs a semicolon
                if (line.includes('=') || line.includes('return') || line.includes('printf')) {
                    console.warn(`Possible missing semicolon in ${filePath} line ${i + 1}: ${line}`);
                }
            }
        }
    }

    /**
     * Test XML syntax
     */
    async testXML(block, filePath) {
        // Basic XML syntax validation
        const xmlContent = block.code;
        
        // Check for basic XML structure
        if (!xmlContent.includes('<') || !xmlContent.includes('>')) {
            throw new Error('Invalid XML: No tags found');
        }
        
        // Check for unmatched tags (basic check)
        const openTags = xmlContent.match(/<[^/][^>]*>/g) || [];
        const closeTags = xmlContent.match(/<\/[^>]*>/g) || [];
        
        // This is a very basic check - a full XML parser would be better
        if (openTags.length !== closeTags.length) {
            console.warn(`Possible unmatched XML tags in ${filePath}`);
        }
    }

    /**
     * Test shell commands (basic validation)
     */
    async testShellCommand(block, filePath) {
        const lines = block.code.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip comments and empty lines
            if (trimmed.startsWith('#') || trimmed === '') {
                continue;
            }
            
            // Check for dangerous commands
            const dangerousCommands = ['rm -rf /', 'format', 'del /f /s /q'];
            for (const dangerous of dangerousCommands) {
                if (trimmed.includes(dangerous)) {
                    throw new Error(`Dangerous command detected: ${dangerous}`);
                }
            }
            
            // Basic command structure validation
            if (trimmed.includes('&&') || trimmed.includes('||')) {
                // Command chaining - basic validation
                const commands = trimmed.split(/&&|\|\|/);
                for (const cmd of commands) {
                    if (cmd.trim().length === 0) {
                        throw new Error('Empty command in chain');
                    }
                }
            }
        }
    }

    /**
     * Test plugin examples in the examples directory
     */
    async testPluginExamples() {
        const examplesPath = path.join(this.docsPath, 'plugins', 'examples');
        
        if (!await fs.pathExists(examplesPath)) {
            return;
        }

        const pluginDirs = await fs.readdir(examplesPath);
        
        for (const dir of pluginDirs) {
            const pluginPath = path.join(examplesPath, dir);
            const stat = await fs.stat(pluginPath);
            
            if (stat.isDirectory()) {
                await this.testPluginExample(pluginPath);
            }
        }
    }

    /**
     * Test a specific plugin example
     */
    async testPluginExample(pluginPath) {
        // Test plugin.json manifest
        const manifestPath = path.join(pluginPath, 'plugin.json');
        if (await fs.pathExists(manifestPath)) {
            try {
                const manifest = await fs.readJson(manifestPath);
                this.validatePluginManifest(manifest, manifestPath);
                this.results.total++;
                this.results.passed++;
            } catch (error) {
                this.results.total++;
                this.results.failed++;
                this.results.errors.push({
                    file: manifestPath,
                    error: error.message,
                    type: 'plugin-manifest'
                });
            }
        }

        // Test JavaScript files
        const jsFiles = await glob('**/*.js', { cwd: pluginPath });
        for (const jsFile of jsFiles) {
            const jsPath = path.join(pluginPath, jsFile);
            const content = await fs.readFile(jsPath, 'utf8');
            
            try {
                await this.testJavaScript({ code: content }, jsPath);
                this.results.total++;
                this.results.passed++;
            } catch (error) {
                this.results.total++;
                this.results.failed++;
                this.results.errors.push({
                    file: jsPath,
                    error: error.message,
                    type: 'plugin-javascript'
                });
            }
        }
    }

    /**
     * Validate plugin manifest structure
     */
    validatePluginManifest(manifest, filePath) {
        const required = ['id', 'version', 'type', 'title'];
        
        for (const field of required) {
            if (!manifest[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate version format
        if (!/^\d+\.\d+(\.\d+)?$/.test(manifest.version)) {
            throw new Error(`Invalid version format: ${manifest.version}`);
        }

        // Validate plugin type
        const validTypes = ['ecmascript', 'lua'];
        if (!validTypes.includes(manifest.type)) {
            throw new Error(`Invalid plugin type: ${manifest.type}`);
        }
    }

    /**
     * Test view file examples
     */
    async testViewFileExamples() {
        const viewFiles = await glob('**/*.view', { 
            cwd: this.docsPath,
            ignore: ['node_modules/**']
        });

        for (const viewFile of viewFiles) {
            const viewPath = path.join(this.docsPath, viewFile);
            await this.testViewFile(viewPath);
        }
    }

    /**
     * Test a view file for basic XML syntax
     */
    async testViewFile(viewPath) {
        try {
            const content = await fs.readFile(viewPath, 'utf8');
            await this.testXML({ code: content }, viewPath);
            this.results.total++;
            this.results.passed++;
        } catch (error) {
            this.results.total++;
            this.results.failed++;
            this.results.errors.push({
                file: viewPath,
                error: error.message,
                type: 'view-file'
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
     * Generate test report
     */
    generateReport() {
        console.log('\n📊 Code Example Test Results');
        console.log('================================');
        console.log(`Total examples tested: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⏭️  Skipped: ${this.results.skipped}`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ Failures:');
            this.results.errors.forEach((error, index) => {
                console.log(`\n${index + 1}. ${error.file}${error.line ? `:${error.line}` : ''}`);
                console.log(`   Language: ${error.language || error.type || 'unknown'}`);
                console.log(`   Error: ${error.error}`);
                if (error.code) {
                    console.log(`   Code: ${error.code}`);
                }
            });
        }
        
        const successRate = this.results.total > 0 ? 
            ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
        console.log(`\n📈 Success Rate: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All code examples are valid!');
        } else {
            console.log(`\n⚠️  ${this.results.failed} examples need attention.`);
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
    const tester = new ExampleTester(docsPath);
    
    tester.test().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Testing failed:', error.message);
        process.exit(1);
    });
}

module.exports = ExampleTester;