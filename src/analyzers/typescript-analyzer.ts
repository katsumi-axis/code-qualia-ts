import * as fs from 'fs';
import { parse } from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { MethodInfo } from '../types';
import { glob } from 'glob';

export class TypeScriptAnalyzer {
  async analyzeMethods(exclude: string[]): Promise<MethodInfo[]> {
    const methods: MethodInfo[] = [];
    const files = await this.findTypeScriptFiles(exclude);

    for (const file of files) {
      try {
        const fileMethods = await this.analyzeFile(file);
        methods.push(...fileMethods);
      } catch (error) {
        console.warn(`Failed to analyze ${file}: ${error}`);
      }
    }

    return methods;
  }

  private async findTypeScriptFiles(exclude: string[]): Promise<string[]> {
    const pattern = '**/*.{ts,tsx}';
    const files = await glob(pattern, {
      ignore: exclude,
      cwd: process.cwd(),
      absolute: true,
    });

    return files;
  }

  private async analyzeFile(filePath: string): Promise<MethodInfo[]> {
    const methods: MethodInfo[] = [];
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const ast = parse(content, {
        loc: true,
        range: true,
        comment: false,
      });

      this.traverseAST(ast, filePath, methods);
    } catch (error) {
      console.warn(`Failed to parse ${filePath}: ${error}`);
    }

    return methods;
  }

  private traverseAST(node: any, filePath: string, methods: MethodInfo[], className?: string): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    switch (node.type) {
      case AST_NODE_TYPES.ClassDeclaration:
      case AST_NODE_TYPES.ClassExpression:
        const currentClassName = node.id?.name || 'AnonymousClass';
        this.traverseAST(node.body, filePath, methods, currentClassName);
        break;

      case AST_NODE_TYPES.MethodDefinition:
        if (node.key?.type === AST_NODE_TYPES.Identifier) {
          methods.push({
            file_path: filePath,
            class_name: className,
            method_name: node.key.name,
            line_number: node.loc?.start.line || 0,
            complexity: this.calculateComplexity(node.value),
          });
        }
        break;

      case AST_NODE_TYPES.FunctionDeclaration:
        if (node.id?.name) {
          methods.push({
            file_path: filePath,
            method_name: node.id.name,
            line_number: node.loc?.start.line || 0,
            complexity: this.calculateComplexity(node),
          });
        }
        break;

      case AST_NODE_TYPES.VariableDeclarator:
        if (node.init?.type === AST_NODE_TYPES.FunctionExpression ||
            node.init?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          if (node.id?.type === AST_NODE_TYPES.Identifier) {
            methods.push({
              file_path: filePath,
              method_name: node.id.name,
              line_number: node.loc?.start.line || 0,
              complexity: this.calculateComplexity(node.init),
            });
          }
        }
        break;

      case AST_NODE_TYPES.Property:
        if (node.value?.type === AST_NODE_TYPES.FunctionExpression ||
            node.value?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          if (node.key?.type === AST_NODE_TYPES.Identifier) {
            methods.push({
              file_path: filePath,
              class_name: className,
              method_name: node.key.name,
              line_number: node.loc?.start.line || 0,
              complexity: this.calculateComplexity(node.value),
            });
          }
        }
        break;
    }

    for (const key in node) {
      if (key !== 'parent' && node[key]) {
        if (Array.isArray(node[key])) {
          for (const child of node[key]) {
            this.traverseAST(child, filePath, methods, className);
          }
        } else if (typeof node[key] === 'object') {
          this.traverseAST(node[key], filePath, methods, className);
        }
      }
    }
  }

  private calculateComplexity(node: any): number {
    let complexity = 1;

    const traverse = (n: any): void => {
      if (!n || typeof n !== 'object') {
        return;
      }

      switch (n.type) {
        case AST_NODE_TYPES.IfStatement:
        case AST_NODE_TYPES.ConditionalExpression:
        case AST_NODE_TYPES.SwitchCase:
        case AST_NODE_TYPES.WhileStatement:
        case AST_NODE_TYPES.DoWhileStatement:
        case AST_NODE_TYPES.ForStatement:
        case AST_NODE_TYPES.ForInStatement:
        case AST_NODE_TYPES.ForOfStatement:
          complexity++;
          break;
        case AST_NODE_TYPES.LogicalExpression:
          if (n.operator === '&&' || n.operator === '||') {
            complexity++;
          }
          break;
      }

      for (const key in n) {
        if (key !== 'parent' && n[key]) {
          if (Array.isArray(n[key])) {
            for (const child of n[key]) {
              traverse(child);
            }
          } else if (typeof n[key] === 'object') {
            traverse(n[key]);
          }
        }
      }
    };

    traverse(node);
    return complexity;
  }
}