const {
  CompSelectAPI,
} = require('../index');

const transformers = {
  filter: {
    type: 'SELECTOR',
    fn: (task) => (args) => {
      const { deps, last } = splitDepsLast(args);
      return last.filter((item) => task.resultFunc(...deps, item));
    }
  },
};

describe('compSelect', () => {
  describe('constructor', () => {
    it('stores the SelectorCreator and standardHandlers', () => {
      class SelectorCreator {}
      const compSelect = new CompSelectAPI(SelectorCreator, transformers);
      expect(compSelect.transformers).toBe(transformers);
      expect(compSelect.SelectorCreator).toBe(SelectorCreator);
    });

    it('adds transformers to the passed class', () => {
      class SelectorCreator {}
      const compSelect = new CompSelectAPI(SelectorCreator, transformers);

      expect(typeof SelectorCreator.prototype.filter)
        .toEqual('function');
    });
  });

  describe('composableSelector', () => {
    let compSelect;
    class SelectorCreator {}
    beforeEach(() => {
      compSelect = new CompSelectAPI(SelectorCreator, transformers);
    });

    it('throws if there is no createSelector method', () => {
      expect(compSelect.composableSelector).toThrow();
    });

    it('return an instance of the passed SelectorCreator', () => {
      compSelect.registerCreateSelector(jest.fn());
      const mySelector = compSelect.composableSelector((state) => state.ids);
      expect(mySelector).toBeInstanceOf(compSelect.SelectorCreator);
    });
  });

  describe('registerTransformers', () => {
    let compSelect;
    class SelectorCreator {}

    beforeEach(() => {
      compSelect = new CompSelectAPI(SelectorCreator, transformers);
    });

    it('adds handlers to the SelectorCreator', () => {
      const tHandlers = {
        reduce: {
          type: 'SELECTOR',
          fn: (transformer) => (args) => {}
        },
      };

      compSelect.registerTransformers(tHandlers);
      const reduceFn = compSelect.SelectorCreator.prototype.reduce;
      expect(typeof reduceFn).toBe('function');
    });
  });

  describe('registerCreateSelector', () => {
    let compSelect;
    class SelectorCreator {}
    let createSelector;

    beforeEach(() => {
      createSelector = jest.fn();
      compSelect = new CompSelectAPI(SelectorCreator, transformers);
    });

    it('stores createSelector', () => {
      compSelect.registerCreateSelector(createSelector);
      expect(compSelect.createSelector).toBe(createSelector);
    });
  });
});
