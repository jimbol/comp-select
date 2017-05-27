// SelectorCreator
// ==================
// The chaining methods the user sees are an on instance of SelectorCreator
const { splitDepsLast } = require('./util');

const SELECTOR = 'SELECTOR';
const STATIC = 'STATIC';

module.exports = class SelectorCreator {
  constructor(source, transformers, createSelector) {
    this.source = source;
    this.transformers = transformers;
    this.createSelector = createSelector;
    this.tasks = [];
  }

  create() {
    return tasks.reduce((prevSelector, task) => {
      const transformer = this.transformers[task.name];

      if (transformer.type === SELECTOR) {
        return this.createSelector(...task.selectors, prevSelector, transformer.fn(task));
      } else if (transformer.type === STATIC) {
        return this.createSelector(...task.selectors, transformer.fn(task));
      }
    }, sourceSelector);
  }
}
