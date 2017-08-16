export const validateFunctions = (funcs) => {
  funcs.forEach((func) => {
    if (typeof func !== 'function') {
      throw new Error(`Expected type of "function".  Instead got "${typeof func}".`);
    }
  });

  return funcs;
};
