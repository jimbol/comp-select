const createTaskBuilders  = require('../../src/task-builder');
const { SELECTOR, STATIC, POPULATE } = require('../../src/constants');

const transformers = {
  filter: {
    type: SELECTOR,
    fn: (task) => (args) => {}
  },
  getEach: {
    type: STATIC,
    fn: (task) => (prevResult) => {}
  },
  populate: {
    type: POPULATE,
    fn: (task) => (prevResult) => {}
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
    function fake(){}

    const fakeSelector = jest.fn();
    results.filter.apply(context, ['fakeResultFunc']);
    results.filter.apply(context, ['fakeSelector1', 'fakeSelector2', 'fakeResultFunc']);
    results.getEach.apply(context, ['fake.path', 'fakeFallbackValue']);
    results.populate.apply(context, [fake]);
    results.populate.apply(context, ['fake.path', fake]);
    results.populate.apply(context, [{ 'fake.path': fake }]);
    expect(context).toMatchSnapshot();
  });
});
