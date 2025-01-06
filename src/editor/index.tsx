import React, { useImperativeHandle, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Indent from './extension/indent.js';
import { TextAlign } from './extension/text-align.js';
import FontSize from './extension/font-size.js';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import UploadImage from './extension/pro-image/index.js';
import BgColor from './extension/bg-color.js';
import Link from '@tiptap/extension-link';
import { Select, Modal, Input, Dropdown, Button, ColorPicker } from 'antd';
import { EditorAction } from './editor.js';
import './editor.scss'
const { Option, } = Select;

const RichTextEditor: React.FC<{
  actionRef?: React.Ref<EditorAction>
}> = ({ actionRef }) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const fontSizeValues = [8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 36, 48, 72];
  const editor = useEditor({
    content: '',
    extensions: [
      StarterKit,
      Color.configure({ types: [TextStyle.name, ListItem.name], }),
      TextStyle.configure({ types: ['heading', 'paragraph', ListItem.name], } as any),
      Underline,
      Indent,
      TextAlign,
      FontSize,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      UploadImage,
      BgColor,
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
      })
    ],
  });

  const onFocus = () => editor?.chain().focus();
  const onBold = () => onFocus()?.toggleBold().run();
  const onItalic = () => onFocus()?.toggleItalic().run();

  const onTextTypeChange = (key: string) => {
    switch (key) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        // eslint-disable-next-line no-case-declarations
        const type = key.replace('h', '');
        onFocus()?.toggleHeading({ level: Number(type) as any, }).run();
        break;
      default:
        onFocus()?.setParagraph().run();
        break;
    }
  };

  const onFontSizeChange = (size: any) => {
    (onFocus() as any)?.setFontSize(size).run();
  };

  const onSetLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    setLinkOpen(true);
    setLinkUrl(previousUrl);
  };

  const onLinkOk = () => {
    setLinkOpen(false);
    if (linkUrl) {
      onFocus()?.extendMarkRange('link').setLink({ href: linkUrl, }).run();
    } else {
      onFocus()?.extendMarkRange('link').unsetLink().run();
    }
  };

  const getValue = () => {
    let value = editor?.getHTML();
    value = value === '<p></p>' ? '' : value;
    if (value && !value.includes('<style')) {
      value = `<style>.rich-preview a{cursor: pointer; color: #6A00F5;text-decoration: underline;} .rich-preview table{border-collapse:collapse;margin:1rem 0;overflow:hidden;table-layout:fixed;width:100%}.rich-preview table td,.rich-preview table th{border:1px solid rgba(61,37,20,.12);box-sizing:border-box;min-width:1em;padding:6px 8px;position:relative;vertical-align:top}.rich-preview table td>*,.rich-preview table th>*{margin-bottom:0}.rich-preview table th{background-color:rgba(61,37,20,.05);font-weight:bold;text-align:left}.rich-preview table .selectedCell:after{background:rgba(61,37,20,.08);content:"";left:0;right:0;top:0;bottom:0;pointer-events:none;position:absolute;z-index:2}</style><div class="rich-preview">${value}</div>`;
    }
    return value;
  };

  const setValue = (value: any) => {
    let v = `${value || ''}`;
    if (v) {
      const s = '<div class="rich-preview">';
      if (v.indexOf(s) >= 0) {
        v = v.slice(v.indexOf(s) + s.length, -6);
      }
    }
    editor?.commands.setContent(v, false);
  };

  const textType = (() => {
    if (!editor) return 'p'; // 如果 editor 不存在，直接返回 'p'
    if (editor?.isActive('paragraph')) {
      return 'p';
    }
    // 使用映射表定义 heading 级别和对应的值
    const headingLevels = {
      h1: 1,
      h2: 2,
      h3: 3,
      h4: 4,
      h5: 5,
      h6: 6,
    };

    // 遍历映射表，检查当前激活的 heading 级别
    for (const [type, level] of Object.entries(headingLevels)) {
      if (editor?.isActive('heading', { level, })) {
        return type;
      }
    }
    // 默认返回 'p'
    return 'p';
  })();
  const fontSizeValue = editor ? editor?.getAttributes('textStyle').fontSize || '字号' : '字号';
  const colorValue = editor ? editor?.getAttributes('textStyle').color : false;
  const bgColorValue = editor ? editor?.getAttributes('textStyle').backgroundColor : false;

  const indentActive = editor ? editor?.getAttributes('paragraph').indent : false;
  useImperativeHandle(actionRef, () => {
    return {
      setValue,
      getValue
    } as EditorAction
  })
  return (
    <div className="editor rich-text">
      <div className="toolbar">
        <div>
          <Button
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().chain().focus().undo().run()}
          >
            <span>Undo</span>
          </Button>
          <Button
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().chain().focus().redo().run()}
          >
            <span>Redo</span>
          </Button>
          <Button
            onClick={onBold}
            className={editor?.isActive('bold') ? 'is-active' : ''}
          >
            <span>Bold</span>
          </Button>
          <Button
            onClick={onItalic}
            className={editor?.isActive('italic') ? 'is-active' : ''}
            disabled={!editor?.can().chain().focus().toggleItalic().run()}
          >
            <span>Italic</span>
          </Button>
          <Button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={editor?.isActive('underline') ? 'is-active' : ''}
            disabled={!editor?.can().chain().focus().toggleUnderline().run()}
          >
            <span>Underline</span>
          </Button>
          <span className="separator"></span>
          <Button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={editor?.isActive('orderedList') ? 'is-active' : ''}
          >
            <span>Ordered List</span>
          </Button>
          <Button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={editor?.isActive('bulletList') ? 'is-active' : ''}
          >
            <span>Bullet List</span>
          </Button>
          <span className="separator"></span>
          <Button
            onClick={() => editor?.chain().focus().indent().run()}
            className={indentActive ? 'is-active' : ''}
          >
            <span>Indent</span>
          </Button>
          <Button
            onClick={() => editor?.chain().focus().outdent().run()}
            disabled={!indentActive}
          >
            <span>Outdent</span>
          </Button>
          <span className="separator"></span>
          <Button
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={editor?.isActive({ textAlign: 'left', }) ? 'is-active' : ''}
          >
            <span>Align Left</span>
          </Button>
          <Button
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className={editor?.isActive({ textAlign: 'center', }) ? 'is-active' : ''}
          >
            <span>Align Center</span>
          </Button>
          <Button
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className={editor?.isActive({ textAlign: 'right', }) ? 'is-active' : ''}
          >
            <span>Align Right</span>
          </Button>
        </div>
        <div className="secbar">
          <Select
            size="small"
            value={textType}
            onChange={onTextTypeChange}
          >
            <Option value="p">段落</Option>
            <Option value="h1">标题 1</Option>
            <Option value="h2">标题 2</Option>
            <Option value="h3">标题 3</Option>
            <Option value="h4">标题 4</Option>
            <Option value="h5">标题 5</Option>
            <Option value="h6">标题 6</Option>
          </Select>
          <Select
            size="small"
            value={fontSizeValue}
            onChange={onFontSizeChange}
          >
            {fontSizeValues.map((v) => (
              <Option
                key={v}
                value={v}
              >
                {v}
              </Option>
            ))}
          </Select>
          <ColorPicker
            value={colorValue || '#000'}
            onChange={(c) => editor?.chain().focus().setColor(c.toHexString()).run()}
          >
            <Button
              className={colorValue ? 'is-active' : ''}
              style={{ color: colorValue, }}
            >
              <span>Text Color</span>
            </Button>
          </ColorPicker>
          <ColorPicker
            value={bgColorValue || '#fff'}
            onChange={(c) => editor?.chain().focus().setBgColor(c.toHexString()).run()}
          >
            <Button
              className={bgColorValue ? 'is-active' : ''}
              style={{ color: bgColorValue, }}
            >
              <span>Background Color</span>
            </Button>
          </ColorPicker>
          <Button
            onClick={onSetLink}
            className={editor?.isActive('link') ? 'is-active' : ''}
          >
            <span>Link</span>
          </Button>
          <Button onClick={() => editor?.chain().focus().addImage().run()}>
            <span>Image</span>
          </Button>
          <Dropdown
            overlay={
              <div className="drop-menu">
                <Button onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true, }).run()}>
                  插入表格
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().addColumnBefore().run()}
                  disabled={!editor?.can().addColumnBefore()}
                >
                  列之前插入
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().addColumnAfter().run()}
                  disabled={!editor?.can().addColumnAfter()}
                >
                  列之后插入
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().deleteColumn().run()}
                  disabled={!editor?.can().deleteColumn()}
                >
                  删除列
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().addRowBefore().run()}
                  disabled={!editor?.can().addRowBefore()}
                >
                  行之前插入
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().addRowAfter().run()}
                  disabled={!editor?.can().addRowAfter()}
                >
                  行之后插入
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().deleteRow().run()}
                  disabled={!editor?.can().deleteRow()}
                >
                  删除行
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().deleteTable().run()}
                  disabled={!editor?.can().deleteTable()}
                >
                  删除表格
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().mergeCells().run()}
                  disabled={!editor?.can().mergeCells()}
                >
                  合并单元格
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().splitCell().run()}
                  disabled={!editor?.can().splitCell()}
                >
                  拆分单元格
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
                  disabled={!editor?.can().toggleHeaderColumn()}
                >
                  设置表头列
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
                  disabled={!editor?.can().toggleHeaderRow()}
                >
                  设置表头行
                </Button>
                <Button
                  onClick={() => editor?.chain().focus().toggleHeaderCell().run()}
                  disabled={!editor?.can().toggleHeaderCell()}
                >
                  设置表头单元格
                </Button>
              </div>
            }
            trigger={['click']}
          >
            <Button>
              <span>Table</span>
            </Button>
          </Dropdown>
        </div>
      </div>
      <EditorContent
        className="content"
        editor={editor}
      />
      <Modal
        open={linkOpen}
        onOk={onLinkOk}
        onCancel={() => setLinkOpen(false)}
        title="设置链接"
      >
        <div>
          <span>链接地址： </span>
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            style={{ width: '220px', display: 'inline', }}
          />
        </div>
        <div className="warning mt-2">地址为空则取消设置链接！！</div>
      </Modal>
    </div>
  );
};

export default RichTextEditor;