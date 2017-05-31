const { createSelector } = require('reselect');
const {
  registerCreateSelector,
  registerTransformers,
  composableSelector,
} = require('../index');

const getFooHash = (state) => state.fooHash;
const getBarHash = (state) => state.barHash;
const getSelectedFooIds = (state) => state.selectedFooIds;
const getSelectedBarIds = (state) => state.selectedBarIds;

registerCreateSelector(createSelector);

describe('integration', () => {

  it('works together', () => {
    const sel = composableSelector(getSelectedFooIds)
      .populate(getFooHash)
      .filter((foo = {}) => foo.id === 2)
      .create();

    console.log(sel({
      selectedFooIds: [1, 2],
      fooHash: {
        1: { id: 1 },
        2: { id: 2 },
      }
    }));
  });
});
