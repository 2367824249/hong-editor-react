import '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';

/**
 * This extension allows you to color your text.
 */
const BgColor = Extension.create({
  name: 'bgColor',
  addOptions () {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes () {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => { let _a; return (_a = element.style.backgroundColor) === null || _a === void 0 ? void 0 : _a.replace(/['"]+/g, ''); },
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      }
    ];
  },
  addCommands () {
    return {
      setBgColor: color => ({ chain, }) => {
        return chain()
          .setMark('textStyle', { backgroundColor: color, })
          .run();
      },
      unsetBgColor: () => ({ chain, }) => {
        return chain()
          .setMark('textStyle', { backgroundColor: null, })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

export default BgColor;