const { createSelector } = require('reselect');
const {
  registerCreateSelector,
  composableSelector,
} = require('../index');

const getFooHash = (state) => state.fooHash;
const getBarHash = (state) => state.barHash;
const getSelectedFooIds = (state) => state.selectedFooIds;
const getSelectedBarIds = (state) => state.selectedBarIds;

registerCreateSelector(createSelector);

describe('integration', () => {

  it.only('works together', () => {
    const sel = composableSelector(getSelectedFooIds)
      .populate(getFooHash)
      .filter((foo = {}) => foo.id === 2)
      .create();

    console.log(sel.source);
    console.log(sel.tasks);

    expect(sel({
      selectedFooIds: [1, 2],
      fooHash: {
        1: { id: 1 },
        2: { id: 2 },
      }
    })).toEqual([{ id: 2 }]);
  });

  describe('static task builders', () => {

    describe('#get', () => {
      it('grabs a value at path', () => {
        const sel = composableSelector(getSelectedFooIds)
          .get('[0]')
          .create();

        expect(sel({
          selectedFooIds: ['oh hi der'],
        })).toEqual('oh hi der');
      });

      it('falls back', () => {
        const sel = composableSelector(getSelectedFooIds)
          .get('[0]', 'FALLBACK')
          .create();

        expect(sel({})).toEqual('FALLBACK');
      });
    });

    describe('#getEach', () => {
      it('grabs a value at path', () => {
        const sel = composableSelector(getSelectedFooIds)
          .populate(getFooHash)
          .getEach('id')
          .create();

        expect(sel({
          selectedFooIds: [1, 2],
          fooHash: {
            1: { id: 1 },
            2: { id: 2 },
          },
        })).toEqual([1, 2]);
      });

      it('falls back', () => {
        const sel = composableSelector(getSelectedFooIds)
          .populate(getFooHash)
          .getEach('id', 'NO ID')
          .create();

        expect(sel({
          selectedFooIds: [1, 2],
          fooHash: {},
        })).toEqual(['NO ID', 'NO ID']);
      });
    });

    describe('#slice', () => {
      it('grabs a value at path', () => {
        const sel = composableSelector(getSelectedFooIds)
          .slice(0, 1)
          .create();

        expect(sel({
          selectedFooIds: [1, 2],
        })).toEqual([1]);
      });

      it('falls back', () => {
        const sel = composableSelector(getSelectedFooIds)
          .slice(0, 1)
          .create();

        expect(sel({
          selectedFooIds: [],
        })).toEqual([]);
      });
    });

    describe('#flatten', () => {
      it('grabs a value at path', () => {
        const sel = composableSelector(getSelectedFooIds)
          .populate(getFooHash)
          .flatten('vals')
          .create();

        expect(sel({
          selectedFooIds: [1, 2],
          fooHash: {
            1: { vals: [10, 20] },
            2: { vals: [30, 40] },
          },
        })).toEqual([10, 20, 30, 40]);
      });

      it('falls back to empty array', () => {
        const sel = composableSelector(getSelectedFooIds)
          .populate(getFooHash)
          .flatten('vals')
          .create();

        expect(sel({
          selectedFooIds: [1, 2],
          fooHash: {
            1: {},
            2: {},
          },
        })).toEqual([]);
      });
    });

  });

  describe('selector task builders', () => {

    describe('#selector', () => {

      it('passed args into the selector', () => {
        const sel = composableSelector(getSelectedFooIds)
          .selector(getFooHash, (hash, ids) => {
            return ids.map((id) => hash[id]);
          })
          .create();

        expect(
          sel({
            selectedFooIds: [1, 2],
            fooHash: {
              1: { id: 1 },
              2: { id: 2 },
            },
          })
        ).toEqual([{ id: 1 }, { id: 2 }]);
      });

    });

    it('throws when array not passed', () => {
      expect(() =>
        composableSelector(getSelectedFooIds)
          .filter('not a function')
      ).toThrow(new Error('Expected type of "function".  Instead got "string".'));
    });
  });
});
