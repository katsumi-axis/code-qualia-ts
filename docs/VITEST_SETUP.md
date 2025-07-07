# Vitest Setup Guide for Code Qualia

## Installing Vitest with Coverage

```bash
npm install -D vitest @vitest/coverage-c8
# or for istanbul coverage
npm install -D vitest @vitest/coverage-istanbul
```

## Vitest Configuration

Create a `vitest.config.ts` file:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'c8', // or 'istanbul'
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: './coverage',
      // Important: ensure coverage-final.json is generated
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
      ],
    },
  },
})
```

## Running Tests with Coverage

```bash
# Run tests with coverage
vitest run --coverage

# Or add to package.json scripts
"scripts": {
  "test": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Using with Code Qualia

After running tests with coverage:

```bash
# Generate quality analysis
npx code-qualia-ts generate
```

The tool will automatically detect and use Vitest's coverage data.