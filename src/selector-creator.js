const { splitDepsLast } = require('./util');

module.exports = class SelectorCreator {
  constructor(source, helpers) {
    this.source = source;
    this.handlers = helpers;
    this.transformers = [];
  }

  // TODO: Dynamically add methods based on passed helpers
  filter(...args) {
    const lastIndex = args.length - 1;
    const { deps, last } = splitDepsLast(args);

    const newTransformer = {
      name: 'filter',
      selectors: deps
      resultFunc: last
    };

    this.transformers = [
      ...this.transformers,
      newTransformer,
    ];
  }

  create() {
    return transformers.reduce((prevSelector, t) => {
      const handler = this.handlers[t.name];

      if (handler.type === SELECTOR) {
        return createSelector(...t.selectors, prevSelector, handler.fn(t));
      } // else if (handler.type === SELECTOR) {}
    }, sourceSelector);
  }
}
