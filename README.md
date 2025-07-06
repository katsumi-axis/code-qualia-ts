# Code Qualia TypeScript

**A tool for communicating developer intuition and code quality perception to AI through configurable parameters**

Code Qualia helps developers express their subjective understanding and feelings about code quality to AI systems. By combining quantitative metrics (coverage, complexity, git activity) with configurable weights that reflect your development priorities and intuitions, it creates a "quality fingerprint" that AI can understand and use for better code analysis and recommendations.

## 🎯 Key Features

- **Developer Intuition Translation**: Convert your subjective code quality perceptions into quantifiable parameters
- **Configurable Quality Weights**: Express what matters most to you - complexity, coverage, change frequency, or directory importance
- **AI-Ready Output**: Generate structured data that AI systems can use to understand your code priorities
- **Multiple Data Sources**: Integrates with Jest/NYC/C8 coverage, ESLint complexity, and Git to capture comprehensive code context
- **Flexible Interface**: CLI tool with JSON, CSV, and human-readable output formats

## 🚀 Installation

Install via npm:

```bash
npm install --save-dev code-qualia-ts
```

Or with yarn:
```bash
yarn add -D code-qualia-ts
```

## 📋 Usage

### Setup

First, generate a configuration file for your project:

```bash
# Auto-detect project type and generate qualia.yml
npx code-qualia-ts install
```

This command automatically detects whether you're working with a Node.js application, React/Vue/Angular project, or a TypeScript library and generates an appropriate configuration file.

### Generate Test Coverage

Before running the analysis, ensure you have test coverage data:

```bash
# For Jest
npm test -- --coverage

# For Vitest
vitest run --coverage
# or if using npm scripts
npm run test:coverage
```

### Basic Analysis

```bash
# Analyze top 3 methods (default)
npx code-qualia-ts generate

# Analyze top 10 methods  
npx code-qualia-ts generate --top-n 10

# Use custom config file
npx code-qualia-ts generate --config custom_qualia.yml

# Output in different formats
npx code-qualia-ts generate --format json
npx code-qualia-ts generate --format csv
npx code-qualia-ts generate --format table
```

### Sample Output

```
📊 Top 3 methods requiring test coverage:

1. src/models/user.ts:21
   Method: canAccessFeature
   Priority Score: 18.6
   Coverage: 50.0%
   Complexity: 7
   Git Commits: 0

2. src/models/user.ts:35
   Method: calculateDiscount
   Priority Score: 11.4
   Coverage: 50.0%
   Complexity: 4
   Git Commits: 0

3. packages/users/src/models/userProfile.ts:5
   Method: displayName
   Priority Score: 7.8
   Coverage: 0.0%
   Complexity: 5
   Git Commits: 0
```

## ⚙️ Configuration

Create a `qualia.yml` file in your project root:

```yaml
# Quality indicators (code issues that need fixing)
quality_weights:
  test_coverage: 1.5          # Weight for test coverage (lower coverage = higher priority)
  cyclomatic_complexity: 1.0  # Weight for cyclomatic complexity (higher complexity = higher priority)

# Importance indicators (how critical the code is)
importance_weights:
  change_frequency: 0.8         # Weight for git change frequency (more changes = higher importance)
  architectural_importance: 1.2 # Weight for architectural importance (critical paths = higher importance)

# Path-based architectural importance weights
architectural_weights:
  - path: "src/models/**/*.ts"
    weight: 2.0      # Models are critical for business logic
  - path: "src/services/**/*.ts"
    weight: 1.8      # Services contain complex business logic
  - path: "src/controllers/**/*.ts"
    weight: 1.5      # Controllers handle user interactions
  - path: "src/components/**/*.tsx"
    weight: 1.3      # React/Vue/Angular components
  - path: "src/utils/**/*.ts"
    weight: 1.0      # Utility functions standard weight

# Files to exclude from analysis
exclude:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "node_modules/**/*"
  - "dist/**/*"
  - "coverage/**/*"

# Days of git history to analyze
git_history_days: 90
```

## 🔧 Requirements

- **Jest/Vitest/NYC/C8**: For test coverage data
- **ESLint with complexity rules**: For code complexity analysis  
- **Git**: For file change history
- **TypeScript**: Version 4.0 or higher

> 📝 For Vitest setup instructions, see [docs/VITEST_SETUP.md](docs/VITEST_SETUP.md)


## 🏗️ How It Works

Code Qualia calculates a priority score for each method using a multiplicative approach that separates quality issues from code importance:

**FinalScore = QualityScore × ImportanceScore**

Where:
- **QualityScore** = `(W_test_coverage × TestCoverageFactor) + (W_cyclomatic_complexity × ComplexityFactor)`
- **ImportanceScore** = `(W_change_frequency × ChangeFrequencyFactor) + (W_architectural_importance × ArchitecturalFactor)`

**Quality Indicators** (code issues that need fixing):
- **TestCoverageFactor**: `(1.0 - coverage_rate)` - lower coverage = higher quality risk
- **ComplexityFactor**: Cyclomatic complexity from ESLint - higher complexity = higher quality risk

**Importance Indicators** (how critical the code is):
- **ChangeFrequencyFactor**: Number of commits in specified time period - more changes = higher importance
- **ArchitecturalFactor**: Weight based on file location (configurable) - critical paths = higher importance

This approach ensures that both quality issues AND importance must be present for a method to rank highly, providing more logical prioritization.


## 🧪 Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration
```

### Smoke Testing

Code Qualia includes a comprehensive smoke test suite that validates functionality against sample TypeScript applications in the `smoke/sample_apps` directory.

## 📊 Output Formats

Code Qualia supports multiple output formats for flexibility:

### Human-readable (default)
```
📊 Top 3 methods requiring test coverage:

1. src/models/user.ts:21
   Method: canAccessFeature
   Priority Score: 10.15
   Coverage: 50.0%
   Complexity: 7
   Git Commits: 0

2. packages/users/src/models/userProfile.ts:5
   Method: displayName
   Priority Score: 7.7
   Coverage: 0.0%
   Complexity: 5
   Git Commits: 0
```

### JSON Format
```json
[
  {
    "file_path": "src/models/user.ts",
    "class_name": "User",
    "method_name": "canAccessFeature",
    "line_number": 21,
    "score": 10.15,
    "details": {
      "coverage": 0.5,
      "complexity": 7,
      "git_commits": 0
    }
  },
  {
    "file_path": "packages/users/src/models/userProfile.ts",
    "class_name": "UserProfile",
    "method_name": "displayName",
    "line_number": 5,
    "score": 7.7,
    "details": {
      "coverage": 0.0,
      "complexity": 5,
      "git_commits": 0
    }
  }
]
```

### CSV Format
```csv
file_path,method_name,line_number,score,coverage,complexity,git_commits
src/models/user.ts,canAccessFeature,21,10.15,50.0,7,0
packages/users/src/models/userProfile.ts,displayName,5,7.7,0.0,5,0
```

### Table Format
```
+----------------------------------------------+------------------+------+-------+----------+------------+----------+
| File                                         | Method           | Line | Score | Coverage | Complexity | Commits  |
+----------------------------------------------+------------------+------+-------+----------+------------+----------+
| src/models/user.ts                           | canAccessFeature |   21 | 10.15 |    50.0% |          7 |        0 |
| packages/users/src/models/userProfile.ts     | displayName      |    5 |  7.70 |     0.0% |          5 |        0 |
+----------------------------------------------+------------------+------+-------+----------+------------+----------+
```

All formats can be redirected to files using standard Unix redirection:
```bash
npx code-qualia-ts generate --format json > analysis.json
npx code-qualia-ts generate --format csv > analysis.csv
```

## 🌟 Inspiration

This project draws its philosophical foundation from [euglena1215/code-qualia](https://github.com/euglena1215/code-qualia), which pioneered the concept of quantifying developer intuition about code quality. We've adapted and expanded these ideas for the TypeScript ecosystem while maintaining the core principle: bridging the gap between human code perception and AI understanding.


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the test suite (`npm test`)
5. Commit your changes (`git commit -am 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
