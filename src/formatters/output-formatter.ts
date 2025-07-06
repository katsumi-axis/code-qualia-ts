import Table from 'cli-table3';
import { createObjectCsvStringifier } from 'csv-writer';
import { MethodScore, OutputFormat } from '../types';

export class OutputFormatter {
  format(scores: MethodScore[], format: OutputFormat, topN: number): string {
    const topScores = scores.slice(0, topN);

    switch (format) {
      case 'json':
        return this.formatJson(topScores);
      case 'csv':
        return this.formatCsv(topScores);
      case 'table':
        return this.formatTable(topScores);
      default:
        return this.formatHuman(topScores);
    }
  }

  private formatHuman(scores: MethodScore[]): string {
    if (scores.length === 0) {
      return 'No methods found to analyze.';
    }

    let output = `📊 Top ${scores.length} methods requiring test coverage:\n\n`;

    scores.forEach((score, index) => {
      output += `${index + 1}. ${score.file_path}:${score.line_number}\n`;
      if (score.class_name) {
        output += `   Class: ${score.class_name}\n`;
      }
      output += `   Method: ${score.method_name}\n`;
      output += `   Priority Score: ${score.score.toFixed(2)}\n`;
      output += `   Coverage: ${(score.details.coverage * 100).toFixed(1)}%\n`;
      output += `   Complexity: ${score.details.complexity}\n`;
      output += `   Git Commits: ${score.details.git_commits}\n`;
      output += '\n';
    });

    return output;
  }

  private formatJson(scores: MethodScore[]): string {
    const output = scores.map(score => ({
      file_path: score.file_path,
      class_name: score.class_name,
      method_name: score.method_name,
      line_number: score.line_number,
      score: parseFloat(score.score.toFixed(2)),
      details: {
        coverage: parseFloat(score.details.coverage.toFixed(3)),
        complexity: score.details.complexity,
        git_commits: score.details.git_commits,
      },
    }));

    return JSON.stringify(output, null, 2);
  }

  private formatCsv(scores: MethodScore[]): string {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'file_path', title: 'file_path' },
        { id: 'method_name', title: 'method_name' },
        { id: 'line_number', title: 'line_number' },
        { id: 'score', title: 'score' },
        { id: 'coverage', title: 'coverage' },
        { id: 'complexity', title: 'complexity' },
        { id: 'git_commits', title: 'git_commits' },
      ],
    });

    const records = scores.map(score => ({
      file_path: score.file_path,
      method_name: score.method_name,
      line_number: score.line_number,
      score: score.score.toFixed(2),
      coverage: (score.details.coverage * 100).toFixed(1),
      complexity: score.details.complexity,
      git_commits: score.details.git_commits,
    }));

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  }

  private formatTable(scores: MethodScore[]): string {
    const table = new Table({
      head: ['File', 'Method', 'Line', 'Score', 'Coverage', 'Complexity', 'Commits'],
      colWidths: [45, 18, 6, 7, 10, 12, 10],
    });

    scores.forEach(score => {
      table.push([
        this.truncate(score.file_path, 43),
        this.truncate(score.method_name, 16),
        score.line_number.toString(),
        score.score.toFixed(2),
        `${(score.details.coverage * 100).toFixed(1)}%`,
        score.details.complexity.toString(),
        score.details.git_commits.toString(),
      ]);
    });

    return table.toString();
  }

  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return '...' + str.slice(-(maxLength - 3));
  }
}