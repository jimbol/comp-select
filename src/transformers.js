const { splitDepsLast } = require('./util');
const SELECTOR = 'SELECTOR';

const baseTransformers = {
  filter: {
    type: SELECTOR,
    fn: (task) => (args) => {
      const { deps, last } = splitDepsLast(args);
      return last.filter((item) => task.resultFunc(...deps, item));
    }
  },
};

module.exports = { baseTransformers };
