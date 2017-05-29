# Comp-Select: Composable Reselect
A [re-select](https://github.com/reactjs/reselect) enhancer designed to work along-side your existing selectors. It allows document linking and composable transformations written in a declarative manner giving you part of the power of an ORM without all the work.

## Goals
- Allow easy linking between records
- Allow composable transformations
- Uses existing re-select api and memoization
- No strict schemas

## Example
### State shape
```es6
type State = {
  fooHash: {
    [Foo.id]: Foo,
  },
  selectedFooIds: Array<Foo.id>,
  barHash: {
    [Bar.id]: Bar,
  };
}

type Foo = {
  id: FooId,
  links: {
    bars: Array<Bar.id>,
  }
};

type BarHash = {
  [BarId]: Bar,
};

type Bar = {
  id: BarId,
  name: string,
};
```

### Dependency selectors
```es6
const getSelectedFooIds = (state) => state.selectedFooIds
const getFooHash = (state) => state.fooHash
const getBarHash = (state) => state.barHash
```

### The new way
```es6
const getBarNamesFromFooIds = composableSelector(getSelectedFooIds)
  .populate(getFooHash);
  .populate({
    'links.bars': getBarHash,
  })
  .flatten('links.bars')
  .getEach('name')
  .create();
```

### The old way
```es6
const getBarNamesFromFooIds = createSelector(getSelectedFooIds, getFooHash, getBarHash,
  (selectedFooIds, fooHash, barHash) => {
    const selectedFoos = selectedFooIds.map((id) => fooHash[id]);

    const selectedFooWithBars = [...selectedFoos]((foo) => {
      foo.links.bars = foo.links.bars.map((barId) => barHash[barId]);
    });

    const selectedBars = [].concat(
      ...selectedFooWithBars.map((foo) => get(foo, 'links.bars')));

    return selectedBars.map((bar) => bar.name);
  });
```


# API - Transformers
There are three main categories of Transformers
- [Static Transformers](#static-transformers)
- [Selector Transformers](#selector-transformers)
- [Populate Transformers](#populate-transformer)

## Static Transformers
Takes static values as arguments such as `path`.

For example, in order to get `target value`
```es6
obj = { outer: { inner: { superInner: 'target value' } } };
```

You can use `get`
```es6
.get('outer.inner.superInner')
```
The path used, `outer.inner.superInner` never changes.

### `.get(Path): *`
- Given an Object
- Returns value at the path

### `.getEach(Path): Array<*>`
- Given an Array of Objects
- Returns value at the path for each

### `.flatten(Path): Array<*>`
- Given an Array of Objects with Arrays at the path
- Returns values at the path for each, flattened

### `.keys()`
- The same as [`Object.keys()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

### `.values()`
- The same as [`Object.values()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)

### `.slice(index, length): Array<*>`
- The same as [`Array.prototype.slice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice?v=example)


## Selector Transformers
Selector based transformers work like re-select selectors.

Each takes a list of selectors, ending with a `resultFunc` Function. `resultFunc` will receive the results of each selector in order, the final argument will be the previous output.
```es6
.select(selectorA, selectorB, (a, b, previousOutput) => {
  // Do something
})
```

Selector Transformers don't *require* selectors as arguments. For example:
```es6
composableSelector(getItems)
  .filter((item) => item.isValid)
```
Only the `resultFunc` is provided, no selectors.

### `.select(...inputSelectors, resultFunc): *`
- Operates on anything
- Accepts 0 to n `inputSelectors`
- Requires a `resultFunc` as the last argument
  - `resultFunc` receives selector outputs as arguments, in order
  - `resultFunc` receives previous output as the last argument
- returns any value

### `.filter(...inputSelectors, resultFunc): Array<*>`
- Operates on an array
- Accepts 0 to n `inputSelectors`
- Requires a `resultFunc` as the last argument
  - `resultFunc` receives selector outputs as arguments, in order
  - `resultFunc` gets called for each item in the previous output
  - `resultFunc` is expected to return `true` or `false`
- returns any value

### `.map(...inputSelectors, resultFunc): *`
- Operates on an array
- Accepts 0 to n `inputSelectors`
- Requires a `resultFunc` as the last argument
  - `resultFunc` receives selector outputs as arguments, in order
  - `resultFunc` gets called for each item in the previous output
  - `resultFunc` is expected to return `true` or `false`
- returns any value


## Populating fields
`populate` is used to populate id fields with records from a hash selector.
- It operates on arrays of ids or arrays of records.
- It can be used in three ways.

### 1. Link from list of ids
```
.populate(SELECTOR)
```
- Operates on a list of ids
- Finds record on `SELECTOR` result for each id
- Returns an array

```es6
const getSelectedFoos = composableSelector(getSelectedFooIds)
  .populate(getFooHash);
```

### 2. Link single path
```
.populate(PATH, SELECTOR)
```
- Operates on a list of records
- Finds record on `SELECTOR` result for each id at `PATH` on each passed record
- Returns an array with records attached

```es6
const getSelectedFoosWithBars = composableSelector(getSelectedFoos)
  .populate('links.bars', getBarHash);
```

### 3. Link many paths
```
.populate({ [PATH]: SELECTOR })
```
- Operates on a list of records
- Finds record on `SELECTOR` result for each id at `PATH` on each passed record
- Returns an array with records attached

```es6
const getSelectedFoosWithBarsAndBaz = composableSelector(getSelectedFoos)
  .populate({
    'links.bars': getBarHash,
    'links.baz': getBazHash,
  });
```


## More?
- What other transformers are useful?
- Allow registering custom transformers

## Registering custom transformers
It is easy to add new, or custom transformers.  As transformers become universal, they may be added to the standard transformers.  Otherwise, they'll

```es6
registerTransformers({
  filter: {
    type: SELECTOR,
    fn: (task) => (args) => {
      const { deps, last } = splitDepsLast(args);
      return last.filter((item) => task.resultFunc(...deps, item));
    }
  }
});
```

## Examples
### `getConversationsByThread`
#### The new way
```es6
export const getConversationsByThread = composableSelector(getSelectedThreads)
  .populate('links.conversations', getConversations)
  .flatten('links.conversations')
  .create();

```
#### The old way
```es6
export const getConversationsByThread = createSelector(
  getConversations,
  getThreadIdsSelected,
  (conversations = {}, threadIds = []) => {
    const values = Object.keys(conversations)
      .map((key) => conversations[key]);

    const initialValue = [];
    return threadIds.reduce((prev, id) =>
      [...prev, ...deepFilter(values, 'links.shared_thread', id)],
      initialValue
    );
  }
);
```

### `getMessagesByThreadIds`
#### The new way
Note how filter is formatted like a selector. Transformers which take functions have the option of including additional selector dependencies which will be used only in that function.
```es6
const getMessagesByThreadIds = composableSelector(getMessages)
  .values()
  .filter(
    (_, props) => props.threadIds,
    (ids, message) => ids.some((id) => id === get(message, 'links.thread'))
  )
  .create();
```

#### The old way
```es6
export const getMessagesByThreadIds = createSelector(
  getMessages,
  (_, props) => props.threadIds,
  (messages, threadIds) => filterMessagesByThreadIds(messages, threadIds)
);

export function filterMessagesByThreadIds(messages: MessagesHash, threadIds: ThreadIds) {
  if (!threadIds) return [];
  return Object
    .values(messages)
    .filter((message) => {
      if (!message.links || !message.links.thread) return false;
      const linkedThreadId = message.links.thread;
      return threadIds.some((threadId) => threadId === linkedThreadId);
    });
}
```

### `getMessagesByThreadSelected`
#### The new way
```es6
export const getMessagesByThreadSelected = composableSelector(getThreadIdsSelected)
  .slice(0, 1)
  .populate(getThreadsHash)
  .populate('links.messages', getMessages)
  .flatten('links.messages')
  .fallback([])
  .create();
```

#### The old way
```es6
export const getMessagesByThreadSelected = createSelector(
  getThreadIdsSelected,
  getMessages,
  getThreadsHash,
  (threadIds = [], messagesHash = {}, threadsHash = {}) => {
    if (threadIds.length === 0 || threadIds.length > 1) return [];
    const selectedThread = threadsHash[threadIds[0]];
    if (!selectedThread) return [];
    const threadMessages = get(selectedThread, 'links.messages', []);
    const messages = threadMessages.map((id) => messagesHash[id]);
    return messages.filter((message) => message !== undefined);
  }
);
```

# Challenges
- Debugging
- Testing


### DEPRECATED
The original api concept which led to comp-select

```es6
const getThreadMessages = createStrictSelector({
  transformer: flattenLinks,
  sources: getSelectedThreads,
  dependencies: {
    'links.messages': getMessageHash,
  },
  fallbackValue: [],
});
```
