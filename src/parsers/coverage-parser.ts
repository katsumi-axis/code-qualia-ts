import * as fs from 'fs';
import * as path from 'path';
import type { CoverageData } from '../types';

export class CoverageParser {
  async parseCoverage(): Promise<CoverageData> {
    const coveragePath = this.findCoverageFile();

    if (!coveragePath) {
      console.warn(
        'No coverage data found. Run tests with coverage first (Jest: npm test -- --coverage, Vitest: vitest run --coverage).'
      );
      return {};
    }

    try {
      const coverageJson = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      return this.normalizeCoverageData(coverageJson);
    } catch (error) {
      console.error(`Error parsing coverage data: ${error}`);
      return {};
    }
  }

  private findCoverageFile(): string | null {
    const possiblePaths = [
      // Jest, Vitest (c8/istanbul)
      'coverage/coverage-final.json',
      'coverage/lcov-report/coverage-final.json',
      // NYC
      '.nyc_output/coverage-final.json',
      // Vitest specific paths
      'coverage/tmp/coverage-final.json',
      '.vitest-coverage/coverage-final.json',
      // Generic fallback
      'coverage/coverage.json',
    ];

    const cwd = process.cwd();

    for (const relativePath of possiblePaths) {
      const fullPath = path.join(cwd, relativePath);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  private normalizeCoverageData(rawCoverage: any): CoverageData {
    const normalized: CoverageData = {};

    for (const [filePath, fileData] of Object.entries(rawCoverage)) {
      if (typeof fileData === 'object' && fileData !== null) {
        const data = fileData as any;

        if (data.statementMap && data.s) {
          normalized[filePath] = {
            lines: {},
          };

          for (const [stmtId, stmtInfo] of Object.entries(data.statementMap)) {
            if (typeof stmtInfo === 'object' && stmtInfo !== null) {
              const stmt = stmtInfo as any;
              const line = stmt.start?.line;
              const hitCount = data.s[stmtId] || 0;

              if (line) {
                normalized[filePath].lines[line] = hitCount;
              }
            }
          }
        }
      }
    }

    return normalized;
  }

  getLineCoverage(
    coverageData: CoverageData,
    filePath: string,
    startLine: number,
    endLine: number
  ): number {
    const fileData = coverageData[filePath];
    if (!fileData) {
      return 0;
    }

    let coveredLines = 0;
    let totalLines = 0;

    for (let line = startLine; line <= endLine; line++) {
      if (line.toString() in fileData.lines) {
        totalLines++;
        if (fileData.lines[line.toString()] > 0) {
          coveredLines++;
        }
      }
    }

    return totalLines > 0 ? coveredLines / totalLines : 0;
  }
}
