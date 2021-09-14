const chalk = require('chalk');
const process = require('process');
const yargs = require('yargs');

const { argv } = yargs(process.argv.slice(2))
  .demandCommand(1)
  .usage(chalk`{bold Usage:}\ntranslations <command>`)
  .command(
    'update <file-to-be-updated>',
    'Update your translation in one file with translations from another.',
    {
      w: {
        alias: 'with',
        nargs: 1,
        describe:
          "path to the .json file with messages entries in format 'id':'translation' that will be used for update.",
        type: 'string',
        demandOption: true,
        normalize: true,
      },
      a: {
        alias: 'action',
        nargs: 1,
        describe: chalk`{bold.magenta optional} argument: provide what to do with the translations,\nif not given - updates already existing ids and then appends new ids.\n`,
        type: 'string',
        demandOption: false,
        choices: ['update-existing', 'append-missing', 'update-all'],
        default: 'update-all',
      },
    }
  )
  .example([
    [
      chalk`{green translations update en.json --with new-en.json -a update-existing}`,
      'updates values of the existing messages `id` in en.json with the values of the corresponding `id`s in new-en.json.',
    ],
    [
      chalk`{green translations update en.json --with new-en.json}`,
      "first updates values of the messages `id` in the en.json with the values of the corresponding `id`s in the new-en.json then appends all 'id':'value' pairs which not in the en.json.",
    ],
  ])
  .command(
    'get-from <file>',
    'Get messages contained in one file and exclude messages contained in another.',
    {
      e: {
        alias: 'exclude',
        nargs: 1,
        describe:
          "path to the .json file with messages entries to be excluded in the format 'id':'translation'.",
        type: 'string',
        demandOption: true,
        normalize: true,
      },
      o: {
        alias: 'output',
        nargs: 1,
        describe: chalk`{bold.magenta optional} argument: provide the path to file to write the command output,\nif not given - writes to the 'untranslated-messages.json' in the same directory as file passed as first argument.\n`,
        type: 'string',
        demandOption: false,
      },
    }
  )
  .example([
    [
      chalk`{cyan translations get-from en.json --exclude new-en.json --output src/languages/to-translate.json}`,
      "writes to the to-translate.json 'id':'value' pairs contained in en.json except messages contained in new-en.json.",
    ],
  ])
  .updateStrings({
    'Commands:': chalk.bold('Commands:'),
    'Examples:': chalk.bold('Examples:'),
  })
  .scriptName('')
  .wrap(80)
  .version(false)
  .help(false);

module.exports = argv;
