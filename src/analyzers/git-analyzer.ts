import simpleGit, { type SimpleGit } from 'simple-git';

export class GitAnalyzer {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async getFileCommitCounts(days: number): Promise<Map<string, number>> {
    const commitCounts = new Map<string, number>();

    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split('T')[0];

      const log = await this.git.log([`--since=${sinceStr}`, '--name-only', '--pretty=format:']);

      const files = log.latest?.hash ? log.all : [];

      for (const commit of files) {
        if (commit.hash) {
          const diff = await this.git.diff(['--name-only', `${commit.hash}^`, commit.hash]);
          const changedFiles = diff.split('\n').filter((f) => f.trim());

          for (const file of changedFiles) {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
              commitCounts.set(file, (commitCounts.get(file) || 0) + 1);
            }
          }
        }
      }
    } catch {
      console.warn('Git analysis failed. Continuing without git data.');
    }

    return commitCounts;
  }

  async getFileCommitCountForPeriod(filePath: string, days: number): Promise<number> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split('T')[0];

      const log = await this.git.log([`--since=${sinceStr}`, '--follow', '--', filePath]);

      return log.total;
    } catch {
      return 0;
    }
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }
}
