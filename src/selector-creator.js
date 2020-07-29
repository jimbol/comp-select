// SelectorCreator
// ==================
// The chaining methods the user sees are an on instance of SelectorCreator
const { splitDepsLast } = require('./util');

const SELECTOR = 'SELECTOR';
const STATIC = 'STATIC';
const POPULATE = 'POPULATE';

module.exports = class SelectorCreator {
  constructor(source, transformers, createSelector) {
    this.source = source;
    this.transformers = transformers;
    this.createSelector = createSelector;
    this.tasks = [];
  }

  create() {
    const finalSelector = this.tasks.reduce((prevSelector, task) => {

      const transformer = this.transformers[task.name];
      let selector;
      if (transformer.type === SELECTOR || transformer.type === POPULATE) {
        selector = this.createSelector(
          ...task.selectors,
          prevSelector,
          transformer.fn(task)
        );

      } else if (transformer.type === STATIC) {
        selector = this.createSelector(
          prevSelector,
          transformer.fn(task),
        );
      }

      return selector;
    }, this.source);

    return decorateSelector(
      finalSelector,
      this.source,
      this.tasks,
    );
  }
}


function decorateSelector(
  selector,
  source,
  tasks,
) {
  function metaSelector(...args) {
    return selector(...args);
  }

  metaSelector.source = source;
  metaSelector.tasks = tasks;

  return metaSelector;
}
