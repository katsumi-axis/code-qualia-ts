export interface Config {
  quality_weights: {
    test_coverage: number;
    cyclomatic_complexity: number;
  };
  importance_weights: {
    change_frequency: number;
    architectural_importance: number;
  };
  architectural_weights: ArchitecturalWeight[];
  exclude: string[];
  git_history_days: number;
}

export interface ArchitecturalWeight {
  path: string;
  weight: number;
}

export interface MethodInfo {
  file_path: string;
  class_name?: string;
  method_name: string;
  line_number: number;
  complexity: number;
}

export interface CoverageData {
  [filePath: string]: {
    lines: {
      [lineNumber: string]: number;
    };
  };
}

export interface MethodScore {
  file_path: string;
  class_name?: string;
  method_name: string;
  line_number: number;
  score: number;
  details: {
    coverage: number;
    complexity: number;
    git_commits: number;
    quality_score: number;
    importance_score: number;
  };
}

export interface GitFileInfo {
  filePath: string;
  commitCount: number;
}

export type OutputFormat = 'table' | 'json' | 'csv';
