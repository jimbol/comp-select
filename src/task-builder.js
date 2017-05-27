// Task Builders
// ==================
// A task builder is a method on the public api
//      `.filter(...)`
// They add tasks to the SelectorCreator
//
// They are generated from available transformers

const SELECTOR = 'SELECTOR';
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
  }

  return builders;
};

const createSelectorTaskBuilder = (key) => (...args) => {
  const lastIndex = args.length - 1;
  const { deps, last } = splitDepsLast(args);

  const newTasks = {
    name: key,
    selectors: deps,
    resultFunc: last,
  };

  this.tasks = [
    ...this.tasks,
    newTasks,
  ];

  return this;
}
