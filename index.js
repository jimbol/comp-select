const SelectorCreator = require('src/selector-creator');
const { transformerHandlers } = require('src/transformers');

const CompSelect {
  constructor(OriginalSelectorCreator, handlersOriginal) {
    this.handlers = handlersOriginal;
    // TODO transformBuilders:
    // Dynamically create transformBuilders based on transformerHandlers
    // Then add transformBuilders to the prototype of SelectorCreator
    this.OriginalSelectorCreator = OriginalSelectorCreator;
    this.SelectorCreator = OriginalSelectorCreator;
  }

  composableSelector(sel){
    return new this.SelectorCreator(sel, transformerHandlers);
  }

  registerTransformers(newTransformerHandlers) {
    // Merge newTransformerHandlers with old ones
    // Generate new transformBuilders from newTransformerHandlers
    // Then add transformBuilders to the prototype of SelectorCreator
    console.log('TODO: allow user to register custom transformers.');
  }
}

const compSelect = new CompSelect(SelectorCreator, transformerHandlers);

module.exports = {
  composableSelector: compSelect.composableSelector.bind(compSelect),
  registerTransformers: compSelect.registerTransformers.bind(compSelect),
};
