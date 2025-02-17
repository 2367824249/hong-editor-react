import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { placeholderPlugin, startImageUpload } from './upload-utils';
import './upload-image.css';
const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

const Image = Node.create({
  name: 'image',
  addOptions () {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },
  inline () {
    return this.options.inline;
  },
  group () {
    return this.options.inline ? 'inline' : 'block';
  },
  draggable: true,
  addProseMirrorPlugins () {
    return [placeholderPlugin];
  },
  addAttributes () {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      style: {
        default: 'width: 100%; height: auto; cursor: pointer;',
        parseHTML: element => {
          const width = element.getAttribute('width');
          return width
            ? `width: ${width}px; height: auto; cursor: pointer;`
            : `${element.style.cssText}`;
        },
      },
      title: {
        default: null,
      },
      loading: {
        default: null,
      },
      srcset: {
        default: null,
      },
      sizes: {
        default: null,
      },
      crossorigin: {
        default: null,
      },
      usemap: {
        default: null,
      },
      ismap: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      referrerpolicy: {
        default: null,
      },
      longdesc: {
        default: null,
      },
      decoding: {
        default: null,
      },
      class: {
        default: null,
      },
      id: {
        default: null,
      },
      name: {
        default: null,
      },
      draggable: {
        default: true,
      },
      tabindex: {
        default: null,
      },
      'aria-label': {
        default: null,
      },
      'aria-labelledby': {
        default: null,
      },
      'aria-describedby': {
        default: null,
      },
    };
  },
  addNodeView () {
    return ({ node, editor, getPos, }) => {
      const { view, options: { editable, }, } = editor;
      const { style, } = node.attrs;
      const $wrapper = document.createElement('div');
      const $container = document.createElement('div');
      const $img = document.createElement('img');
      const iconStyle = 'width: 24px; height: 24px; cursor: pointer;';
      const dispatchNodeView = () => {
        if (typeof getPos === 'function') {
          const newAttrs = Object.assign(Object.assign({}, node.attrs), { style: `${$img.style.cssText}`, });
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
        }
      };
      const paintPositionContoller = () => {
        const $postionController = document.createElement('div');
        const $leftController = document.createElement('img');
        const $centerController = document.createElement('img');
        const $rightController = document.createElement('img');
        const controllerMouseOver = e => {
          e.target.style.opacity = 0.3;
        };
        const controllerMouseOut = e => {
          e.target.style.opacity = 1;
        };
        $postionController.setAttribute('style', 'position: absolute; top: 0%; left: 50%; width: 100px; height: 25px; z-index: 999; background-color: rgba(255, 255, 255, 0.7); border-radius: 4px; border: 2px solid #6C6C6C; cursor: pointer; transform: translate(-50%, -50%); display: flex; justify-content: space-between; align-items: center; padding: 0 10px;');
        $leftController.setAttribute('src', 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_left/default/20px.svg');
        $leftController.setAttribute('style', iconStyle);
        $leftController.addEventListener('mouseover', controllerMouseOver);
        $leftController.addEventListener('mouseout', controllerMouseOut);
        $centerController.setAttribute('src', 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_center/default/20px.svg');
        $centerController.setAttribute('style', iconStyle);
        $centerController.addEventListener('mouseover', controllerMouseOver);
        $centerController.addEventListener('mouseout', controllerMouseOut);
        $rightController.setAttribute('src', 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_right/default/20px.svg');
        $rightController.setAttribute('style', iconStyle);
        $rightController.addEventListener('mouseover', controllerMouseOver);
        $rightController.addEventListener('mouseout', controllerMouseOut);
        $leftController.addEventListener('click', () => {
          $img.setAttribute('style', `${$img.style.cssText} margin: 0 auto 0 0;`);
          dispatchNodeView();
        });
        $centerController.addEventListener('click', () => {
          $img.setAttribute('style', `${$img.style.cssText} margin: 0 auto;`);
          dispatchNodeView();
        });
        $rightController.addEventListener('click', () => {
          $img.setAttribute('style', `${$img.style.cssText} margin: 0 0 0 auto;`);
          dispatchNodeView();
        });
        $postionController.appendChild($leftController);
        $postionController.appendChild($centerController);
        $postionController.appendChild($rightController);
        $container.appendChild($postionController);
      };
      $wrapper.setAttribute('style', 'display: flex;');
      $wrapper.appendChild($container);
      $container.setAttribute('style', `${style}`);
      $container.appendChild($img);
      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null)
          return;
        $img.setAttribute(key, value);
      });
      if (!editable)
        return { dom: $img, };
      const dotsPosition = [
        'top: -4px; left: -4px; cursor: nwse-resize;',
        'top: -4px; right: -4px; cursor: nesw-resize;',
        'bottom: -4px; left: -4px; cursor: nesw-resize;',
        'bottom: -4px; right: -4px; cursor: nwse-resize;'
      ];
      let isResizing = false;
      let startX, startWidth;
      $container.addEventListener('click', () => {
        //remove remaining dots and position controller
        if ($container.childElementCount > 3) {
          for (let i = 0; i < 5; i++) {
            $container.removeChild($container.lastChild);
          }
        }
        paintPositionContoller();
        $container.setAttribute('style', `position: relative; border: 1px dashed #6C6C6C; ${style} cursor: pointer;`);
        // eslint-disable-next-line array-callback-return
        Array.from({ length: 4, }, (_, index) => {
          const $dot = document.createElement('div');
          $dot.setAttribute('style', `position: absolute; width: 9px; height: 9px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[index]}`);
          $dot.addEventListener('mousedown', e => {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = $container.offsetWidth;
            const onMouseMove = (e) => {
              if (!isResizing)
                return;
              const deltaX = index % 2 === 0 ? -(e.clientX - startX) : e.clientX - startX;
              const newWidth = startWidth + deltaX;
              $container.style.width = newWidth + 'px';
              $img.style.width = newWidth + 'px';
            };
            const onMouseUp = () => {
              if (isResizing) {
                isResizing = false;
              }
              dispatchNodeView();
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          });
          $container.appendChild($dot);
        });
      });
      document.addEventListener('click', (e) => {
        const $target = e.target;
        const isClickInside = $container.contains($target) || $target.style.cssText === iconStyle;
        if (!isClickInside) {
          const containerStyle = $container.getAttribute('style');
          const newStyle = containerStyle === null || containerStyle === void 0 ? void 0 : containerStyle.replace('border: 1px dashed #6C6C6C;', '');
          $container.setAttribute('style', newStyle);
          if ($container.childElementCount > 3) {
            for (let i = 0; i < 5; i++) {
              $container.removeChild($container.lastChild);
            }
          }
        }
      });
      return {
        dom: $wrapper,
      };
    };
  },
  parseHTML () {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      }
    ];
  },
  renderHTML ({ HTMLAttributes, }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
  addCommands () {
    return {
      setImage: options => ({ commands, }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
      addImage: () => () => {
        let fileHolder = document.createElement('input');
        fileHolder.setAttribute('type', 'file');
        fileHolder.setAttribute('accept', 'image/*');
        fileHolder.setAttribute('style', 'visibility:hidden');
        document.body.appendChild(fileHolder);

        const view = this.editor.view;
        const schema = this.editor.schema;

        fileHolder.addEventListener('change', (e) => {
          if (
            view.state.selection.$from.parent.inlineContent &&
            (e.target)?.files?.length
          ) {
            startImageUpload(
              view,
              (e.target || {}).files[0],
              schema
            );
          }
          view.focus();
        });
        fileHolder.click();
        return true;
      },
    };
  },
  addInputRules () {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => {
          const [, , alt, src, title] = match;
          return { src, alt, title, };
        },
      })
    ];
  },
});

export default Image;
