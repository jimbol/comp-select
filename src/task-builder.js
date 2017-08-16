const { splitDepsLast } = require('./util');
const { validateFunctions } = require('./validate');
const { SELECTOR, STATIC, POPULATE } = require('./constants');

// Task Builders
// ==================
// A task builder is a method on the public api
//      `.filter(...)`
// They add tasks to the SelectorCreator
//
// They are generated from available transformers

// `createTaskBuilders` takes a hash of transformers
// and returns a list of "task builder" function for each
module.exports = function createTaskBuilders(transformers = {}) {
  return Object
    .keys(transformers)
    .reduce((builders, key) =>
      createBuilder(builders, key, transformers), {});
}

const createBuilder = (builders, key, transformers) => {
  const transformer = transformers[key];
  if (transformer.type === SELECTOR) {
    builders[key] = createSelectorTaskBuilder(key);
  } else if (transformer.type === STATIC) {
    builders[key] = createStaticTaskBuilder(key);
  } else if (transformer.type === POPULATE) {
    builders[key] = createPopulateTaskBuilder(key);
  }

  return builders;
};

const createSelectorTaskBuilder = (key) => function(...args) {
  const { deps, last } = splitDepsLast(validateFunctions(args));

  const newTasks = {
    name: key,
    selectors: deps,
    resultFunc: last,
  };

  this.tasks = [...this.tasks, newTasks];

  return this;
}

const createStaticTaskBuilder = (key) => function(...args) {
  const newTasks = {
    name: key,
    staticArgs: args,
  };

  this.tasks = [...this.tasks, newTasks];

  return this;
}

const createPopulateTaskBuilder = (key) => function(a, b) {
  const task = {
    name: key,
  };

  const aType = typeof a;

  if (aType === 'function') {
    task.selectors = validateFunctions([a]);

  } else if (aType === 'object') {
    task.paths = Object.keys(a);
    task.selectors = validateFunctions(
      task.paths.map((key) => a[key])
    );

  } else if (aType === 'string') {
    task.paths = [a];
    task.selectors = validateFunctions([b]);

  }

  this.tasks = [...this.tasks, task];

  return this;
}
