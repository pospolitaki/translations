const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const process = require('process');
const yargs = require('yargs');

const argv = require('./argv');

const getIds = (obj) => Object.keys(obj);

const getObjectFromFile = (file) => {
  let objectFromFile;
  try {
    objectFromFile = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (error) {
    console.log('Error while reading file:\n', error.message);
    process.exit();
  }
  return objectFromFile;
};

const writeToFile = (output, buffer) => {
  try {
    fs.writeFileSync(output, buffer, 'utf-8');
  } catch (error) {
    console.log('Error while writing to file:\n', error.message);
    process.exit();
  }
};

const formatJSON = (JSONobject) =>
  JSON.stringify(JSONobject, null, 4);

function updateExistingIdCb(ids, targetObj, srcObj, id) {
  if (ids.includes(id) && !(targetObj[id] === srcObj[id])) {
    console.log(chalk.cyan(`updated: [${id}]`));
    targetObj[id] = srcObj[id];
  }
}

function appendMissingIdCb(ids, targetObj, srcObj, id) {
  if (!ids.includes(id)) {
    console.log(chalk.cyan(`added: [${id}]`));
    targetObj[id] = srcObj[id];
  }
}

function getUniqueTranslationsCb(
  ids,
  translations,
  bufferObject,
  id
) {
  if (!ids.includes(id)) {
    console.log(chalk`{cyan message id: ${id}}`);
    bufferObject[id] = translations[id];
  }
}
function getUniqueTranslations() {
  const translFile = argv.file;
  const fileToExclude = argv.exclude;
  const output =
    argv.o ??
    `${path.dirname(translFile)}/untranslated-messages.json`;
  const translObject = getObjectFromFile(translFile);
  const objectToExclude = getObjectFromFile(fileToExclude);
  const bufferObject = {};
  const idsToExclude = getIds(objectToExclude);
  const ids = getIds(translObject);

  const forEachCb = getUniqueTranslationsCb.bind(
    null,
    idsToExclude,
    translObject,
    bufferObject
  );

  console.log(chalk`{green Writing messages to ${output}:}`);
  ids.forEach(forEachCb);

  const formattedBufferObj = formatJSON(bufferObject);

  writeToFile(output, formattedBufferObj);
}

function updateTranslations() {
  const targetFile = argv['file-to-be-updated'];
  const srcFile = argv.w;
  const action = argv.a;
  const targetObj = getObjectFromFile(targetFile);
  const srcObj = getObjectFromFile(srcFile);
  const idsToUpdate = getIds(targetObj);
  const idsToUpdateFrom = getIds(srcObj);

  const updateCb = updateExistingIdCb.bind(
    null,
    idsToUpdate,
    targetObj,
    srcObj
  );

  const appendCb = appendMissingIdCb.bind(
    null,
    idsToUpdate,
    targetObj,
    srcObj
  );

  const actions = {
    'update-existing': {
      description: chalk`{green Updating {magentaBright ${targetFile} }}`,
      cb: updateCb,
    },
    'append-missing': {
      description: chalk`{green Appending new from {magentaBright ${srcFile} }}`,
      cb: appendCb,
    },
    'update-all': {
      description: chalk.green(
        'Updating existing and appending new ids'
      ),
      cb: (id) => {
        updateCb(id);
        appendCb(id);
      },
    },
  };

  if (actions[action]) {
    console.log(actions[action].description);
    idsToUpdateFrom.forEach((id) => actions[action].cb(id));
  }

  const formattedJSONObject = formatJSON(targetObj, '",', '",\n');
  writeToFile('src/languages/tmp.json', formattedJSONObject);
  // write(fileToUpdate, formattedObject); // TODO: switch to real world files
}

if (argv._.includes('update')) {
  updateTranslations();
} else if (argv._.includes('get-from')) {
  getUniqueTranslations();
} else {
  yargs.showHelp();
}
