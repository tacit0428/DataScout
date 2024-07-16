import React, { useState, useRef, useEffect } from 'react';
import { Button, Dropdown, Menu, Input } from 'antd';
import ReactQuill from 'react-quill';
import { saveAs } from 'file-saver';

import 'react-quill/dist/quill.snow.css';
import './Sidebar.css';
import jsPDF from 'jspdf';
import htmlDocx from 'html-docx-js/dist/html-docx';
import html2canvas from 'html2canvas';

import saveIcon from '../../assets/save_icon.svg';
import exportIcon from '../../assets/export_icon.svg';
import editIcon from '../../assets/edit_icon.svg';
import planeIcon from '../../assets/plane_icon.svg'; 

const modules = {
  toolbar: [
    ['bold', 'underline','italic', 'strike', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'size': [] }],
    [{ 'font': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
    ['link', 'image', 'video'],
  ],
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'align',
  'link', 'image', 'video',
  'color', 'background'
];

const Sidebar = ({ visible, toggleDrawer }) => {
  const [editorContent, setEditorContent] = useState('');
  const [title, setTitle] = useState('');
  const editorRef = useRef(null);
  const [selectionRect, setSelectionRect] = useState(null);

  const updateSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && !selection.isCollapsed) {
        setSelectionRect({
          left: rect.right, // 调整图标位置到文字中心位置
          top: rect.top - 80, // 调整图标位置更接近文字
        });
      } else {
        setSelectionRect(null); // 如果没有选中内容，则隐藏图标
      }
    } else {
      setSelectionRect(null); // 如果没有选中内容，则隐藏图标
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      updateSelection();
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const exportToWord = () => {
    const content = editorRef.current.querySelector('.ql-editor').innerHTML;
    const converted = htmlDocx.asBlob(content);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(converted);
    link.download = `${title || 'document'}.docx`;
    link.click();
  };

  const exportToPDF = async () => {
    const content = editorRef.current.querySelector('.ql-editor').innerHTML;
    const pdf = new jsPDF('p', 'pt', 'a4');

    const styledContent = `
      <div style="width: 100%; padding: 20px;">
        ${content}
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = styledContent;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
    });

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 595.28, canvas.height * (595.28 / canvas.width));
    pdf.save(`${title || 'document'}.pdf`);

    document.body.removeChild(container);
  };

  const exportToHTML = () => {
    const content = editorRef.current.querySelector('.ql-editor').innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    saveAs(blob, `${title || 'document'}.html`);
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={exportToWord}>
        Word
      </Menu.Item>
      <Menu.Item key="2" onClick={exportToPDF}>
        PDF
      </Menu.Item>
      <Menu.Item key="3" onClick={exportToHTML}>
        HTML
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={`sidebar ${visible ? 'open' : ''}`}>
      <Button className="toggle-btn" onClick={toggleDrawer}>
        {visible ? '<' : '>'}
      </Button>
      <div className="content">
        <div className="editor-header">
          <Input 
            className="input"
            placeholder=""
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            prefix={<Button className="edit-btn" style={{ border: 'none', background: 'transparent' }}>
              <img src={editIcon} alt="edit" style={{ width: '10px', height: '10px' }} />
            </Button>}
          />
          <Button className="icon-btn">
            <img src={saveIcon} alt="save" className="icon" />
          </Button>
          <Dropdown overlay={menu} placement="bottomRight">
            <Button className="icon-btn">
              <img src={exportIcon} alt="export" className="icon" />
            </Button>
          </Dropdown>
        </div>
        <div className="editor" ref={editorRef}>
          <ReactQuill 
            value={editorContent}
            onChange={setEditorContent}
            modules={modules}
            formats={formats}
          />
          {selectionRect && (
            <Button
              className="plane-icon"
              style={{
                left: `${selectionRect.left}px`,
                top: `${selectionRect.top}px`,
                position: 'absolute',
                display: selectionRect ? 'flex' : 'none', 
                alignItems: 'center', 
                justifyContent: 'center', 
                pointerEvents: 'auto',
                width: '40px', 
                height: '40px', 
                borderRadius: '20%', 
              }}
              onClick={() => {
                // 添加点击事件处理//待完成：选中之后放到statement处
                console.log('Plane icon button clicked!');
              }}
            >
              <img src={planeIcon} alt="plane" style={{ width: '18px', height: '18px' }} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
