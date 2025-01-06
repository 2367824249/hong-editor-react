/* eslint-disable no-param-reassign */
/* eslint-disable eqeqeq */
//Plugin for placeholder
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import Axios from 'axios';
import { getFileInfo } from '../../../../../libs/utils/file';
import { message } from 'ant-design-vue';
let imagePreview = '';
const uploadFn = (file) => {
  const { name, size, } = file || {};
  const nameArr = `${name}`.split('.');
  if (nameArr.length < 2) {
    message.error('上传文件不合法');
    return Promise.reject('上传文件不合法');
  }
  // eslint-disable-next-line no-useless-escape
  let reg = /^[a-zA-Z0-9\u4e00-\u9fa5\.]+$/;
  if (!reg.test(name)) {
    message.error('文件名不能有特殊符号');
    return Promise.reject('文件名不能有特殊符号');
  }
  const { ext, } = getFileInfo(name);
  const isFileExt = ['jpg', 'png', 'jpeg'].includes(ext);
  if (!isFileExt) {
    return Promise.reject('请上传jpg、png、jpeg的文件格式');
  }
  const fileSize = size / 1024 / 1024;
  if (fileSize > 10) {
    return Promise.reject('只能上传10M以内的文件');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', name);
  return Axios.post('/api-web/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data, }) => {
    if (data && data.data) {
      return data.data.url;
    }
  }).catch(() => {
    return '上传失败';
  });
};

export  const placeholderPlugin = new Plugin({
  state: {
    init () {
      return DecorationSet.empty;
    },
    apply (tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // See if the transaction adds or removes any placeholders
      let action = tr.getMeta(this);
      if (action && action.add) {
        let widget = document.createElement('div');
        let img = document.createElement('img');
        widget.classList.value = 'image-uploading';
        img.src = imagePreview;
        widget.appendChild(img);
        let deco = Decoration.widget(action.add.pos, widget, {
          id: action.add.id,
        });
        set = set.add(tr.doc, [deco]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(undefined, undefined, (spec) => spec.id == action.remove.id)
        );
      }
      return set;
    },
  },
  props: {
    decorations (state) {
      return this.getState(state);
    },
  },
});

//Find the placeholder in editor
function findPlaceholder (state, id) {
  let decos = placeholderPlugin.getState(state);
  let found = decos?.find(undefined, undefined, (spec) => spec.id == id);

  return found?.length ? found[0].from : null;
}

export function startImageUpload (view, file, schema) {
  imagePreview = URL.createObjectURL(file);
  // A fresh object to act as the ID for this upload
  let id = {};

  // Replace the selection with a placeholder
  let tr = view.state.tr;
  if (!tr.selection.empty) tr.deleteSelection();
  tr.setMeta(placeholderPlugin, { add: { id, pos: tr.selection.from, }, });
  view.dispatch(tr);
  uploadFn(file).then(
    (url) => {
      let pos = findPlaceholder(view.state, id);
      // If the content around the placeholder has been deleted, drop
      // the image
      if (pos === null) return;
      // Otherwise, insert it at the placeholder's position, and remove
      // the placeholder
      view.dispatch(
        view.state.tr
          .replaceWith(pos, pos, schema.nodes.uploadImage.create({ src: url, }))
          .setMeta(placeholderPlugin, { remove: { id, }, })
      );
    },
    () => {
      // On failure, just clean up the placeholder
      view.dispatch(tr.setMeta(placeholderPlugin, { remove: { id, }, }));
    }
  );
}