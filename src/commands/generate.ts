import { ConfigParser } from '../parsers/config-parser';
import { CoverageParser } from '../parsers/coverage-parser';
import { TypeScriptAnalyzer } from '../analyzers/typescript-analyzer';
import { GitAnalyzer } from '../analyzers/git-analyzer';
import { ScoreCalculator } from '../analyzers/score-calculator';
import { OutputFormatter } from '../formatters/output-formatter';
import { OutputFormat } from '../types';

interface GenerateOptions {
  config?: string;
  topN: number;
  format: OutputFormat;
}

export class GenerateCommand {
  private configParser: ConfigParser;
  private coverageParser: CoverageParser;
  private tsAnalyzer: TypeScriptAnalyzer;
  private gitAnalyzer: GitAnalyzer;
  private outputFormatter: OutputFormatter;

  constructor() {
    this.configParser = new ConfigParser();
    this.coverageParser = new CoverageParser();
    this.tsAnalyzer = new TypeScriptAnalyzer();
    this.gitAnalyzer = new GitAnalyzer();
    this.outputFormatter = new OutputFormatter();
  }

  async execute(options: GenerateOptions): Promise<void> {
    try {
      const config = await this.configParser.loadConfig(options.config);

      console.error('🔍 Analyzing TypeScript methods...');
      const methods = await this.tsAnalyzer.analyzeMethods(config.exclude);
      
      if (methods.length === 0) {
        console.log('No TypeScript methods found to analyze.');
        return;
      }

      console.error('📊 Loading coverage data...');
      const coverageData = await this.coverageParser.parseCoverage();
      
      console.error('📝 Analyzing git history...');
      const isGitRepo = await this.gitAnalyzer.isGitRepository();
      let gitCommitCounts = new Map<string, number>();
      
      if (isGitRepo) {
        gitCommitCounts = await this.gitAnalyzer.getFileCommitCounts(config.git_history_days);
      } else {
        console.error('⚠️  Not a git repository. Skipping git analysis.');
      }

      console.error('🧮 Calculating priority scores...');
      const calculator = new ScoreCalculator(config, this.coverageParser);
      const scores = calculator.calculateScores(methods, coverageData, gitCommitCounts);

      const output = this.outputFormatter.format(scores, options.format, options.topN);
      console.log(output);

    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  }
}