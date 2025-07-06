import * as fs from 'fs';
import * as yaml from 'yaml';
import * as path from 'path';
import { Config } from '../types';

export class ConfigParser {
  private readonly defaultConfig: Config = {
    quality_weights: {
      test_coverage: 1.5,
      cyclomatic_complexity: 1.0,
    },
    importance_weights: {
      change_frequency: 0.8,
      architectural_importance: 1.2,
    },
    architectural_weights: [
      { path: 'src/models/**/*.ts', weight: 2.0 },
      { path: 'src/services/**/*.ts', weight: 1.8 },
      { path: 'src/controllers/**/*.ts', weight: 1.5 },
      { path: 'src/components/**/*.tsx', weight: 1.3 },
      { path: 'src/utils/**/*.ts', weight: 1.0 },
    ],
    exclude: [
      '**/*.test.ts',
      '**/*.spec.ts',
      'node_modules/**/*',
      'dist/**/*',
      'coverage/**/*',
    ],
    git_history_days: 90,
  };

  async loadConfig(configPath?: string): Promise<Config> {
    const actualConfigPath = configPath || this.findConfigFile();
    
    if (!actualConfigPath || !fs.existsSync(actualConfigPath)) {
      console.warn('No configuration file found, using defaults');
      return this.defaultConfig;
    }

    try {
      const configContent = fs.readFileSync(actualConfigPath, 'utf8');
      const parsedConfig = yaml.parse(configContent) as Partial<Config>;
      
      return this.mergeWithDefaults(parsedConfig);
    } catch (error) {
      console.error(`Error parsing config file: ${error}`);
      throw error;
    }
  }

  private findConfigFile(): string | null {
    const possibleNames = ['qualia.yml', 'qualia.yaml', '.qualia.yml', '.qualia.yaml'];
    const cwd = process.cwd();

    for (const name of possibleNames) {
      const filePath = path.join(cwd, name);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    return null;
  }

  private mergeWithDefaults(partial: Partial<Config>): Config {
    return {
      quality_weights: {
        ...this.defaultConfig.quality_weights,
        ...(partial.quality_weights || {}),
      },
      importance_weights: {
        ...this.defaultConfig.importance_weights,
        ...(partial.importance_weights || {}),
      },
      architectural_weights: partial.architectural_weights || this.defaultConfig.architectural_weights,
      exclude: partial.exclude || this.defaultConfig.exclude,
      git_history_days: partial.git_history_days || this.defaultConfig.git_history_days,
    };
  }

  generateDefaultConfig(projectType?: string): string {
    const config = { ...this.defaultConfig };

    if (projectType === 'react') {
      config.architectural_weights = [
        { path: 'src/components/**/*.tsx', weight: 2.0 },
        { path: 'src/hooks/**/*.ts', weight: 1.8 },
        { path: 'src/services/**/*.ts', weight: 1.5 },
        { path: 'src/utils/**/*.ts', weight: 1.0 },
      ];
    } else if (projectType === 'node') {
      config.architectural_weights = [
        { path: 'src/models/**/*.ts', weight: 2.0 },
        { path: 'src/services/**/*.ts', weight: 1.8 },
        { path: 'src/controllers/**/*.ts', weight: 1.5 },
        { path: 'src/middleware/**/*.ts', weight: 1.3 },
        { path: 'src/utils/**/*.ts', weight: 1.0 },
      ];
    }

    return yaml.stringify(config);
  }
}