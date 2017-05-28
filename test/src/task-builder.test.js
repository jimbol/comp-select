const createTaskBuilders  = require('../../src/task-builder');
const { SELECTOR, STATIC } = require('../../src/constants');

const transformers = {
  filter: {
    type: SELECTOR,
    fn: (task) => (args) => {
      const { deps, last } = splitDepsLast(args);
      return last.filter((item) => task.resultFunc(...deps, item));
    }
  },
  getEach: {
    type: STATIC,
    fn: (task) => (prevResult) => {
      const [path, fallback] = task.staticArgs;
      return prevResult.map((item) => get(item, path, fallback));
    }
  },
};

describe('createTaskBuilders', () => {
  it('creates task builders for passed transformers', () => {
    const results = createTaskBuilders(transformers);
    const context = { tasks: [] };
    expect(typeof results.filter).toBe('function')
    expect(typeof results.getEach).toBe('function')
  });

  it('adds tasks to context when invoked', () => {
    const results = createTaskBuilders(transformers);
    const context = { tasks: [] };
    results.filter.apply(context, ['fakeResultFunc']);
    results.filter.apply(context, ['fakeSelector1', 'fakeSelector2', 'fakeResultFunc']);
    results.getEach.apply(context, ['fake.path', 'fakeFallbackValue']);
    expect(context).toMatchSnapshot();
  });
});
