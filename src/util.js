function splitDepsLast(args) {
  const lastIndex = args.length - 1;
  const last = args[lastIndex];
  const deps = args.slice(0, lastIndex);
  return { deps, last };
}

module.exports = { splitDepsLast };
