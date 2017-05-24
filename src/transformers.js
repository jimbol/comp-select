const { splitDepsLast } = require('./util');

const transformerHandlers = {
  filter: {
    type: SELECTOR,
    fn: (transformer) => (args) => {
      const { deps, last } = splitDepsLast(args);
      return last.filter((item) => transformer.fn(...deps, item));
    }
  },
};

module.exports = { transformerHandlers };
