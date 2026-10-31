export const meta = {
  name: 'check-types',
  description: 'Run bun run --filter storefront check-types and fix all TypeScript errors',
  phases: [
    { title: 'Check Types' },
    { title: 'Fix Errors' }
  ]
};

const TYPE_ERROR_REGEX = /(.*):(\d+):(\d+)\s+-\s+error\s+TS(\d+):\s+(.*)/;

async function checkTypes() {
  phase('Check Types');
  const result = await agent('Run bun run --filter storefront check-types', {
    label: 'Type Check',
    schema: {
      type: 'object',
      properties: {
        output: { type: 'string' },
        exitCode: { type: 'number' }
      },
      required: ['output', 'exitCode']
    }
  });

  const errors = [];
  const lines = result.output.split('\n');
  for (const line of lines) {
    const match = line.match(TYPE_ERROR_REGEX);
    if (match) {
      errors.push({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: match[5]
      });
    }
  }

  return { errors, exitCode: result.exitCode };
}

async function fixErrors(errors) {
  phase('Fix Errors');
  const fixes = await parallel(errors.map(error => () => {
    const prompt = `Fix TypeScript error TS${error.code} in ${error.file} at line ${error.line}: ${error.message}`;
    return agent(prompt, {
      label: `Fix ${error.file}:${error.line}`,
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          changes: { type: 'string' }
        },
        required: ['file', 'changes']
      }
    });
  }));

  return fixes.filter(Boolean);
}

async function main() {
  let result = await checkTypes();
  let iteration = 1;

  while (result.errors.length > 0 && iteration < 5) {
    log(`Iteration ${iteration}: Found ${result.errors.length} TypeScript errors`);
    const fixes = await fixErrors(result.errors);
    result = await checkTypes();
    iteration++;
  }

  if (result.errors.length === 0) {
    log('All TypeScript errors have been fixed!');
  } else {
    log(`Could not fix all TypeScript errors after ${iteration} iterations. Remaining errors: ${result.errors.length}`);
  }

  return result;
}

return main();