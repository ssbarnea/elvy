#!/usr/bin/env node
// const world = 'world';

// export function hello(word: string = world): string {
//   return `Hello ${world}! `;
// }
import yargs from 'yargs';

const args = yargs.options({
  schema: { type: 'string', demandOption: false, alias: 's' },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
}).command('$0', 'Validate one or more YAML files', () => { }, (argv) => {
  console.log(`this command will be run by default with ${argv}`);
}).argv;

console.log(args);
console.log('Hello World');
