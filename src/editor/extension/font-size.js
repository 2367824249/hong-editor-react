import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes () {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            renderHTML: attributes => {
              if (attributes.fontSize) {
                return {
                  style: `font-size: ${attributes.fontSize}px`,
                };
              }
              return null;
            },
            parseHTML: element => {
              return {
                fontSize: element.style.fontSize ? parseInt(element.style.fontSize, 10) : null,
              };
            },
          },
        },
      }
    ];
  },

  addCommands () {
    return {
      setFontSize: (size) => ({ commands, }) => {
        return commands.setMark('textStyle', { fontSize: size, });
      },
      unsetFontSize: () => ({ commands, }) => {
        return commands.unsetMark('textStyle', { fontSize: 14, });
      },
    };
  },

  addKeyboardShortcuts () {
    return {
      'Mod-Shift-1': () => this.editor.commands.setFontSize(12),
      'Mod-Shift-2': () => this.editor.commands.setFontSize(14),
      'Mod-Shift-3': () => this.editor.commands.setFontSize(16),
      'Mod-Shift-4': () => this.editor.commands.setFontSize(18),
      'Mod-Shift-5': () => this.editor.commands.setFontSize(20),
    };
  },
});
export default FontSize;