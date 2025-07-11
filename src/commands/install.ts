import * as fs from 'fs';
import * as path from 'path';
import { ConfigParser } from '../parsers/config-parser';

export class InstallCommand {
  private configParser: ConfigParser;

  constructor() {
    this.configParser = new ConfigParser();
  }

  async execute(): Promise<void> {
    console.log('🔍 Analyzing project structure...');
    
    const projectType = this.detectProjectType();
    console.log(`📦 Detected project type: ${projectType || 'generic TypeScript'}`);

    const configContent = this.configParser.generateDefaultConfig(projectType || undefined);
    const configPath = path.join(process.cwd(), 'qualia.yml');

    if (fs.existsSync(configPath)) {
      console.warn('⚠️  Configuration file already exists: qualia.yml');
      console.log('   To regenerate, please remove the existing file first.');
      return;
    }

    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log('✅ Created configuration file: qualia.yml');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Review and adjust the weights in qualia.yml to match your priorities');
    console.log('   2. Run your test suite with coverage enabled');
    console.log('   3. Run: npx code-qualia-ts generate');
  }

  private detectProjectType(): string | null {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies.react || dependencies['react-dom']) {
        return 'react';
      }
      
      if (dependencies.vue) {
        return 'vue';
      }
      
      if (dependencies['@angular/core']) {
        return 'angular';
      }
      
      if (dependencies.express || dependencies.koa || dependencies.fastify) {
        return 'node';
      }

      return null;
    } catch {
      console.warn('Failed to parse package.json');
      return null;
    }
  }
}