import type { McpServer } from '@modelcontextprotocol/server';
import type { ConstantNode, FunctionNode, MathNode, OperatorNode, ParenthesisNode, SymbolNode } from 'mathjs';
import { parse } from 'mathjs';
import { z } from 'zod';

const functions = new Set(['sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'log10', 'exp', 'floor', 'ceil', 'round', 'min', 'max']);
const operators = new Set(['+', '-', '*', '/', '^']);

function validate(node: MathNode, depth: number, state: { count: number }): void {
  state.count++;
  if (state.count > 64 || depth > 16) {
    throw new Error('Expression too complex');
  }
  switch (node.type) {
    case 'ConstantNode': {
      const value = Number((node as ConstantNode).value);
      if (!Number.isFinite(value) || Math.abs(value) > 1_000_000) {
        throw new Error('Invalid number');
      }
      return;
    }
    case 'SymbolNode': {
      if (!['pi', 'e'].includes((node as SymbolNode).name)) {
        throw new Error('Unknown symbol');
      }
      return;
    }
    case 'ParenthesisNode':
      validate((node as ParenthesisNode).content, depth + 1, state);
      return;
    case 'OperatorNode': {
      const operator = node as OperatorNode;
      if (!operators.has(operator.op)) {
        throw new Error('Unsupported operator');
      }
      if (operator.op === '^') {
        const exponent = operator.args[1];
        if (exponent?.type !== 'ConstantNode' || Number((exponent as ConstantNode).value) > 12) {
          throw new Error('Exponent too large');
        }
      }
      operator.args.forEach(arg => validate(arg, depth + 1, state));
      return;
    }
    case 'FunctionNode': {
      const functionNode = node as FunctionNode;
      if (functionNode.fn.type !== 'SymbolNode' || !functions.has((functionNode.fn as SymbolNode).name)
        || functionNode.args.length > 5) {
        throw new Error('Unsupported function');
      }
      functionNode.args.forEach(arg => validate(arg, depth + 1, state));
      return;
    }
    default:
      throw new Error('Unsupported expression');
  }
}

export function registerMathEvaluator(server: McpServer) {
  server.registerTool('evaluate_math', {
    description: 'Evaluate a bounded arithmetic expression using the KillerTools math engine. Allows basic operators and common numeric functions.',
    inputSchema: { expression: z.string().trim().min(1).max(256) },
  }, async ({ expression }) => {
    try {
      const node = parse(expression);
      validate(node, 0, { count: 0 });
      const value: unknown = node.compile().evaluate();
      if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1_000_000_000_000) {
        throw new Error('Result outside numeric limit');
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify({ value }) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid or unsupported math expression' }], isError: true };
    }
  });
}
