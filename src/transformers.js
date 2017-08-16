const get = require('lodash.get');
const set = require('lodash.set');
const { splitDepsLast } = require('./util');
const { SELECTOR, STATIC, POPULATE } = require('./constants');

const baseTransformers = {
  filter: {
    type: SELECTOR,
    fn: (task) => (...args) => {
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
  populate: {
    type: POPULATE,
    fn: (task) => (...args) => {
      const { deps, last } = splitDepsLast(args);
      const { paths } = task;

      if (!paths) {
        return last.map((id) => deps[0][id])
      }

      return last.map((item) => {

        paths.forEach((path, i) => {

          const ids = get(item, path, []);
          const dep = deps[i];

          if (typeof ids === 'string') {
            return item.set(item, path, dep[ids]);
          }

          item.set(item, path, ids.map((id) => dep[id]));

        });

        return item;
      });
    }
  },
};

module.exports = { baseTransformers };
