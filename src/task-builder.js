const { splitDepsLast } = require('./util');
const { SELECTOR, STATIC, POPULATE } = require('./constants');

// Task Builders
// ==================
// A task builder is a method on the public api
//      `.filter(...)`
// They add tasks to the SelectorCreator
//
// They are generated from available transformers

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
  const { deps, last } = splitDepsLast(args);

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
  const newTasks = {
    name: key,
  };

  const aType = typeof a;
  if (aType === 'function') {
    task.selectors = [a];
  } else if (aType === 'string') {
    task.paths = [a];
    task.selectors = [b];
  } else if (aType === 'object') {
    task.paths = Object.keys(a);
    task.selectors = Object.values(a);
  }

  this.tasks = [...this.tasks, newTasks];

  return this;
}
