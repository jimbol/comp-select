function splitDepsLast(args) {
  const lastIndex = args.length - 1;
  const last = args[lastIndex];
  const deps = args.splice(0, lastIndex);
}

module.exports = { splitDepsLast };
