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

  selector: {
    type: SELECTOR,
    fn: (task) => task.resultFunc,
  },

  get: {
    type: STATIC,
    fn: (task) => (prevResult) => {
      const [path, fallback] = task.staticArgs;
      return get(prevResult, path, fallback);
    }
  },

  getEach: {
    type: STATIC,
    fn: (task) => (prevResult) => {
      const [path, fallback] = task.staticArgs;
      return prevResult.map((item) => get(item, path, fallback));
    }
  },

  slice: {
    type: STATIC,
    fn: (task) => (prevResult) => {
      const [index, length] = task.staticArgs;
      return prevResult.slice(index, length);
    }
  },

  flatten: {
    type: STATIC,
    fn: (task) => (prevResult) => {
      const [path] = task.staticArgs;
      return prevResult.reduce((acc, item) => {
        return [
          ...acc,
          ...get(item, path, []),
        ];
      }, []);
    }
  },

  keys: {
    type: STATIC,
    fn: (task) => (prevResult) => {
      const [path] = task.staticArgs;
      return prevResult.reduce((acc, item) => {
        return [
          ...acc,
          ...get(item, path, []),
        ];
      });
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

      const isArray = Array.isArray(last);
      const lastAsArr = (isArray) ? last : [last];
      const result = lastAsArr.map((item) => {

        paths.forEach((path, i) => {

          const ids = get(item, path, []);
          const dep = deps[i];

          if (typeof ids === 'string') {
            return set(item, path, dep[ids]);
          }

          set(item, path, ids
            .map((id) => dep[id])
            .filter(Boolean)
          );
        });

        return item;
      });

      return (isArray) ? result : last;
    }
  },
};

module.exports = { baseTransformers };
