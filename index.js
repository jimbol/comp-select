/*
transformers
task builders
tasks
selectors
*/
const SelectorCreator = require('./src/selector-creator');
const { baseTransformers } = require('./src/transformers');
const createTaskBuilders = require('./src/task-builder');

class CompSelectAPI {
  constructor(SelectorCreator, transformers) {
    this.transformers = transformers;
    this.taskBuilders = createTaskBuilders(transformers)
    this.SelectorCreator = addMethodsToClass(SelectorCreator, this.taskBuilders);
  }

  composableSelector(sel){
    const { transformers, createSelector } = this;

    if (!createSelector) throw new Error(`
      comp-select requires you to register a "createSelector" function.
      Please register "createSelector" using "registerCreateSelector"
      `);

    return new this.SelectorCreator(sel, transformers, createSelector);
  }

  registerTransformers(newTransformers) {
    this.transformers = {
      ...this.transformers,
      ...newTransformers,
    };

    this.taskBuilders = createTaskBuilders(this.transformers);
    this.SelectorCreator = addMethodsToClass(this.SelectorCreator, this.taskBuilders);
  }

  registerCreateSelector(createSelector) {
    this.createSelector = createSelector;
  }
}

const addMethodsToClass = (C, methodHash) => {
  Object.keys(methodHash)
    .forEach((key) => C.prototype[key] = methodHash[key]);
  return C;
}

const compSelect = new CompSelectAPI(SelectorCreator, baseTransformers);

module.exports = {
  CompSelectAPI,
  registerCreateSelector: (...args) => compSelect.registerCreateSelector(...args),
  registerTransformers: (...args) => compSelect.registerTransformers(...args),
  composableSelector: (...args) => compSelect.composableSelector(...args),
};
