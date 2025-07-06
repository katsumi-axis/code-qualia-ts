import { ConfigParser } from '../parsers/config-parser';

describe('ConfigParser', () => {
  let configParser: ConfigParser;

  beforeEach(() => {
    configParser = new ConfigParser();
  });

  describe('generateDefaultConfig', () => {
    it('should generate default config for generic project', () => {
      const config = configParser.generateDefaultConfig();
      
      expect(config).toContain('quality_weights:');
      expect(config).toContain('test_coverage: 1.5');
      expect(config).toContain('cyclomatic_complexity: 1');
      expect(config).toContain('importance_weights:');
      expect(config).toContain('change_frequency: 0.8');
      expect(config).toContain('architectural_importance: 1.2');
    });

    it('should generate React-specific config', () => {
      const config = configParser.generateDefaultConfig('react');
      
      expect(config).toContain('src/components/**/*.tsx');
      expect(config).toContain('src/hooks/**/*.ts');
      expect(config).toContain('weight: 2');
    });

    it('should generate Node-specific config', () => {
      const config = configParser.generateDefaultConfig('node');
      
      expect(config).toContain('src/models/**/*.ts');
      expect(config).toContain('src/controllers/**/*.ts');
      expect(config).toContain('src/middleware/**/*.ts');
    });
  });
});