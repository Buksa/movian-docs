#!/usr/bin/env node

/**
 * Source Code Analysis Tool for Movian Documentation
 * 
 * Analyzes Movian source code to extract API information, function signatures,
 * and documentation-relevant details.
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class MovianSourceAnalyzer {
    constructor(movianSourcePath) {
        this.sourcePath = movianSourcePath;
        this.analysisResults = {
            ecmascript: {},
            glw: {},
            core: {},
            plugins: {}
        };
    }

    /**
     * Main analysis entry point
     */
    async analyze() {
        console.log('🔍 Starting Movian source code analysis...');
        
        if (!await this.validateSourcePath()) {
            console.error('❌ Invalid Movian source path:', this.sourcePath);
            return false;
        }

        await this.analyzeECMAScriptSources();
        await this.analyzeGLWSources();
        await this.analyzeCoreSources();
        await this.analyzePluginExamples();
        
        await this.generateAnalysisReport();
        
        console.log('✅ Source code analysis complete!');
        return true;
    }

    /**
     * Validate that the source path contains Movian source code
     */
    async validateSourcePath() {
        const requiredFiles = [
            'src/main.c',
            'src/ecmascript',
            'src/ui/glw',
            'Makefile'
        ];

        for (const file of requiredFiles) {
            const fullPath = path.join(this.sourcePath, file);
            if (!await fs.pathExists(fullPath)) {
                console.error(`Missing required file/directory: ${file}`);
                return false;
            }
        }
        return true;
    }

    /**
     * Analyze ECMAScript runtime and API sources
     */
    async analyzeECMAScriptSources() {
        console.log('📜 Analyzing ECMAScript sources...');
        
        const esSourcePath = path.join(this.sourcePath, 'src/ecmascript');
        const esModulesPath = path.join(this.sourcePath, 'res/ecmascript');
        
        // Analyze native ECMAScript bindings
        const cFiles = await glob('**/*.c', { cwd: esSourcePath });
        for (const file of cFiles) {
            const filePath = path.join(esSourcePath, file);
            const analysis = await this.analyzeCFile(filePath);
            this.analysisResults.ecmascript[file] = analysis;
        }

        // Analyze built-in JavaScript modules
        if (await fs.pathExists(esModulesPath)) {
            const jsFiles = await glob('**/*.js', { cwd: esModulesPath });
            for (const file of jsFiles) {
                const filePath = path.join(esModulesPath, file);
                const analysis = await this.analyzeJSFile(filePath);
                this.analysisResults.ecmascript[file] = analysis;
            }
        }
    }

    /**
     * Analyze GLW (OpenGL Widget) system sources
     */
    async analyzeGLWSources() {
        console.log('🎨 Analyzing GLW sources...');
        
        const glwSourcePath = path.join(this.sourcePath, 'src/ui/glw');
        const cFiles = await glob('**/*.c', { cwd: glwSourcePath });
        
        for (const file of cFiles) {
            const filePath = path.join(glwSourcePath, file);
            const analysis = await this.analyzeCFile(filePath);
            this.analysisResults.glw[file] = analysis;
        }
    }

    /**
     * Analyze core system sources
     */
    async analyzeCoreSources() {
        console.log('⚙️ Analyzing core sources...');
        
        const coreFiles = [
            'src/main.c',
            'src/navigator.c',
            'src/service.c',
            'src/plugins.c'
        ];

        for (const file of coreFiles) {
            const filePath = path.join(this.sourcePath, file);
            if (await fs.pathExists(filePath)) {
                const analysis = await this.analyzeCFile(filePath);
                this.analysisResults.core[path.basename(file)] = analysis;
            }
        }
    }

    /**
     * Analyze plugin examples
     */
    async analyzePluginExamples() {
        console.log('🔌 Analyzing plugin examples...');
        
        const pluginExamplesPath = path.join(this.sourcePath, 'plugin_examples');
        if (!await fs.pathExists(pluginExamplesPath)) {
            console.log('No plugin_examples directory found');
            return;
        }

        const pluginDirs = await fs.readdir(pluginExamplesPath);
        for (const dir of pluginDirs) {
            const pluginPath = path.join(pluginExamplesPath, dir);
            const stat = await fs.stat(pluginPath);
            
            if (stat.isDirectory()) {
                const analysis = await this.analyzePluginDirectory(pluginPath);
                this.analysisResults.plugins[dir] = analysis;
            }
        }
    }

    /**
     * Analyze a C source file
     */
    async analyzeCFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const analysis = {
            file: filePath,
            functions: [],
            structs: [],
            enums: [],
            defines: [],
            includes: [],
            comments: []
        };

        // Extract function definitions
        const functionRegex = /^(?:static\s+)?(\w+(?:\s*\*)?)\s+(\w+)\s*\([^)]*\)\s*{/gm;
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            analysis.functions.push({
                returnType: match[1].trim(),
                name: match[2],
                line: this.getLineNumber(content, match.index)
            });
        }

        // Extract struct definitions
        const structRegex = /typedef\s+struct\s*(?:\w+\s*)?\{[^}]+\}\s*(\w+);/gs;
        while ((match = structRegex.exec(content)) !== null) {
            analysis.structs.push({
                name: match[1],
                line: this.getLineNumber(content, match.index)
            });
        }

        // Extract enum definitions
        const enumRegex = /typedef\s+enum\s*(?:\w+\s*)?\{[^}]+\}\s*(\w+);/gs;
        while ((match = enumRegex.exec(content)) !== null) {
            analysis.enums.push({
                name: match[1],
                line: this.getLineNumber(content, match.index)
            });
        }

        // Extract #define statements
        const defineRegex = /^#define\s+(\w+)(?:\s+(.+))?$/gm;
        while ((match = defineRegex.exec(content)) !== null) {
            analysis.defines.push({
                name: match[1],
                value: match[2] ? match[2].trim() : '',
                line: this.getLineNumber(content, match.index)
            });
        }

        // Extract #include statements
        const includeRegex = /^#include\s+[<"]([^>"]+)[>"]$/gm;
        while ((match = includeRegex.exec(content)) !== null) {
            analysis.includes.push({
                file: match[1],
                line: this.getLineNumber(content, match.index)
            });
        }

        return analysis;
    }

    /**
     * Analyze a JavaScript file
     */
    async analyzeJSFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const analysis = {
            file: filePath,
            exports: [],
            functions: [],
            requires: [],
            comments: []
        };

        // Extract function definitions
        const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g;
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            analysis.functions.push({
                name: match[1] || match[2],
                line: this.getLineNumber(content, match.index)
            });
        }

        // Extract exports
        const exportRegex = /exports\.(\w+)|module\.exports\.(\w+)/g;
        while ((match = exportRegex.exec(content)) !== null) {
            analysis.exports.push({
                name: match[1] || match[2],
                line: this.getLineNumber(content, match.index)
            });
        }

        // Extract require statements
        const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
        while ((match = requireRegex.exec(content)) !== null) {
            analysis.requires.push({
                module: match[1],
                line: this.getLineNumber(content, match.index)
            });
        }

        return analysis;
    }

    /**
     * Analyze a plugin directory
     */
    async analyzePluginDirectory(pluginPath) {
        const analysis = {
            path: pluginPath,
            manifest: null,
            mainFile: null,
            viewFiles: [],
            resources: []
        };

        // Read plugin.json manifest
        const manifestPath = path.join(pluginPath, 'plugin.json');
        if (await fs.pathExists(manifestPath)) {
            try {
                analysis.manifest = await fs.readJson(manifestPath);
            } catch (error) {
                console.warn(`Failed to parse manifest: ${manifestPath}`);
            }
        }

        // Find main JavaScript file
        const jsFiles = await glob('*.js', { cwd: pluginPath });
        if (jsFiles.length > 0) {
            const mainJsPath = path.join(pluginPath, jsFiles[0]);
            analysis.mainFile = await this.analyzeJSFile(mainJsPath);
        }

        // Find view files
        const viewFiles = await glob('**/*.view', { cwd: pluginPath });
        analysis.viewFiles = viewFiles;

        // List other resources
        const allFiles = await glob('**/*', { cwd: pluginPath });
        analysis.resources = allFiles.filter(file => 
            !file.endsWith('.js') && 
            !file.endsWith('.view') && 
            !file.endsWith('.json')
        );

        return analysis;
    }

    /**
     * Get line number for a character position in text
     */
    getLineNumber(text, position) {
        return text.substring(0, position).split('\n').length;
    }

    /**
     * Generate comprehensive analysis report
     */
    async generateAnalysisReport() {
        console.log('📊 Generating analysis report...');
        
        const reportPath = path.join(__dirname, '..', 'analysis-report.json');
        await fs.writeJson(reportPath, this.analysisResults, { spaces: 2 });
        
        // Generate summary report
        const summary = this.generateSummary();
        const summaryPath = path.join(__dirname, '..', 'analysis-summary.md');
        await fs.writeFile(summaryPath, summary);
        
        console.log(`📄 Analysis report saved to: ${reportPath}`);
        console.log(`📋 Summary report saved to: ${summaryPath}`);
    }

    /**
     * Generate markdown summary of analysis
     */
    generateSummary() {
        const summary = [];
        summary.push('# Movian Source Code Analysis Summary\n');
        summary.push(`Generated: ${new Date().toISOString()}\n`);
        
        // ECMAScript analysis summary
        summary.push('## ECMAScript Runtime Analysis\n');
        const esFiles = Object.keys(this.analysisResults.ecmascript);
        summary.push(`- **Files analyzed**: ${esFiles.length}`);
        
        let totalFunctions = 0;
        esFiles.forEach(file => {
            const analysis = this.analysisResults.ecmascript[file];
            if (analysis.functions) {
                totalFunctions += analysis.functions.length;
            }
        });
        summary.push(`- **Functions found**: ${totalFunctions}`);
        
        // GLW analysis summary
        summary.push('\n## GLW System Analysis\n');
        const glwFiles = Object.keys(this.analysisResults.glw);
        summary.push(`- **Files analyzed**: ${glwFiles.length}`);
        
        let glwFunctions = 0;
        glwFiles.forEach(file => {
            const analysis = this.analysisResults.glw[file];
            if (analysis.functions) {
                glwFunctions += analysis.functions.length;
            }
        });
        summary.push(`- **Functions found**: ${glwFunctions}`);
        
        // Plugin examples summary
        summary.push('\n## Plugin Examples Analysis\n');
        const pluginCount = Object.keys(this.analysisResults.plugins).length;
        summary.push(`- **Plugin examples found**: ${pluginCount}`);
        
        Object.keys(this.analysisResults.plugins).forEach(plugin => {
            const analysis = this.analysisResults.plugins[plugin];
            summary.push(`  - **${plugin}**: ${analysis.manifest ? analysis.manifest.title || plugin : plugin}`);
        });
        
        summary.push('\n## Next Steps\n');
        summary.push('1. Review analysis results in `analysis-report.json`');
        summary.push('2. Use findings to create accurate API documentation');
        summary.push('3. Extract view file syntax from GLW parser analysis');
        summary.push('4. Document plugin patterns from examples analysis');
        
        return summary.join('\n');
    }
}

// CLI interface
if (require.main === module) {
    const yargs = require('yargs');
    
    const argv = yargs
        .usage('Usage: $0 <movian-source-path>')
        .demandCommand(1, 'Please provide the path to Movian source code')
        .help()
        .argv;
    
    const sourcePath = argv._[0];
    const analyzer = new MovianSourceAnalyzer(sourcePath);
    
    analyzer.analyze().catch(error => {
        console.error('❌ Analysis failed:', error.message);
        process.exit(1);
    });
}

module.exports = MovianSourceAnalyzer;