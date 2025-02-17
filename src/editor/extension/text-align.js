import { Extension } from '@tiptap/core';


export const TextAlign = Extension.create({
  name: 'textAlign',

  addOptions () {
    return {
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    };
  },

  addGlobalAttributes () {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: element => {
              const alignment = element.style.textAlign || this.options.defaultAlignment;
              return this.options.alignments.includes(alignment) ? alignment : this.options.defaultAlignment;
            },
            renderHTML: attributes => {
              if (attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}`, };
            },
          },
        },
      }
    ];
  },

  addCommands () {
    return {
      setTextAlign: (alignment) => ({ commands, }) => {
        if (!this.options.alignments.includes(alignment)) {
          return false;
        }

        return this.options.types
          .map(type => commands.updateAttributes(type, { textAlign: alignment, }))
          .every(response => response);
      },

      unsetTextAlign: () => ({ commands, }) => {
        return this.options.types
          .map(type => commands.resetAttributes(type, 'textAlign'))
          .every(response => response);
      },
    };
  },

  addKeyboardShortcuts () {
    return {
      'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
      'Mod-Shift-j': () => this.editor.commands.setTextAlign('justify'),
    };
  },
});