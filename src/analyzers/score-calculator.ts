import { minimatch } from 'minimatch';
import * as path from 'path';
import type { CoverageParser } from '../parsers/coverage-parser';
import type { Config, CoverageData, MethodInfo, MethodScore } from '../types';

export class ScoreCalculator {
  constructor(
    private config: Config,
    private coverageParser: CoverageParser
  ) {}

  calculateScores(
    methods: MethodInfo[],
    coverageData: CoverageData,
    gitCommitCounts: Map<string, number>
  ): MethodScore[] {
    const scores: MethodScore[] = [];

    for (const method of methods) {
      const relativePath = path.relative(process.cwd(), method.file_path);

      const coverage = this.getMethodCoverage(method, coverageData);
      const gitCommits = gitCommitCounts.get(relativePath) || 0;

      const qualityScore = this.calculateQualityScore(coverage, method.complexity);
      const importanceScore = this.calculateImportanceScore(gitCommits, relativePath);

      const finalScore = qualityScore * importanceScore;

      scores.push({
        file_path: relativePath,
        class_name: method.class_name,
        method_name: method.method_name,
        line_number: method.line_number,
        score: finalScore,
        details: {
          coverage,
          complexity: method.complexity,
          git_commits: gitCommits,
          quality_score: qualityScore,
          importance_score: importanceScore,
        },
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  private getMethodCoverage(method: MethodInfo, coverageData: CoverageData): number {
    const endLine = method.line_number + 10;
    return this.coverageParser.getLineCoverage(
      coverageData,
      method.file_path,
      method.line_number,
      endLine
    );
  }

  private calculateQualityScore(coverage: number, complexity: number): number {
    const coverageFactor = 1.0 - coverage;
    const complexityFactor = complexity;

    const qualityScore =
      this.config.quality_weights.test_coverage * coverageFactor +
      this.config.quality_weights.cyclomatic_complexity * complexityFactor;

    return Math.max(0, qualityScore);
  }

  private calculateImportanceScore(gitCommits: number, filePath: string): number {
    const architecturalWeight = this.getArchitecturalWeight(filePath);

    const importanceScore =
      this.config.importance_weights.change_frequency * gitCommits +
      this.config.importance_weights.architectural_importance * architecturalWeight;

    return Math.max(1, importanceScore);
  }

  private getArchitecturalWeight(filePath: string): number {
    for (const rule of this.config.architectural_weights) {
      if (minimatch(filePath, rule.path)) {
        return rule.weight;
      }
    }
    return 1.0;
  }
}
