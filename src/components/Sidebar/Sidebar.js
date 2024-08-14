import React, { useState, useRef, useEffect } from 'react';
import { Button, Dropdown, Menu, Input } from 'antd';
import ReactQuill, { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';
import { saveAs } from 'file-saver';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'
import 'react-quill/dist/quill.snow.css';
import './Sidebar.css';
import jsPDF from 'jspdf';
import htmlDocx from 'html-docx-js/dist/html-docx';
import html2canvas from 'html2canvas';

import saveIcon from '../../assets/save_icon.svg';
import exportIcon from '../../assets/export_icon.svg';
import editIcon from '../../assets/edit_icon.svg';
import planeIcon from '../../assets/plane_icon.svg'; 

import * as api from '../../axios/api'
import { BalloonLayout } from '../Mindmap/Layout/MDSLayout';

import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  addRootNode: store.addRootNode,
  addChildNode: store.addChildNode,
  addChildNodeForRoot: store.addChildNodeForRoot,
  setEditorRef: store.setEditorRef,
  setEdge: store.setEdge,
  setNode: store.setNode,
})

Quill.register('modules/imageResize', ImageResize);
window.Quill = Quill

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
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize']
  }
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
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectText, setSelectText] = useState('')
  const editorRef = useRef(null);
  const reactQuillRef = useRef(null)
  // const store = useStore(selector, shallow);
  const store = useStore()
  const { fitView } = useReactFlow();
  // const uuid = uuidv4()

  const updateSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && !selection.isCollapsed) {
        setSelectionRect({
          left: rect.right + 5, // 调整图标位置到文字中心位置
          top: rect.top - 50, // 调整图标位置更接近文字
        });
        setSelectText(selection.toString())
      } else {
        setSelectionRect(null); // 如果没有选中内容，则隐藏图标
      }
    } else {
      setSelectionRect(null); // 如果没有选中内容，则隐藏图标
    }
  };

  useEffect(() => {
    store.setEditorRef(reactQuillRef)

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

  const exportToNewPage = () => {
    localStorage.setItem(`newsTitle-${store.pageId}`, title);
    localStorage.setItem(`newsContent-${store.pageId}`, editorContent);
    window.open(`/#/news?id=${store.pageId}`, '_blank');
  }

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={exportToWord}>
        Word
      </Menu.Item>
      <Menu.Item key="2" onClick={exportToPDF}>
        PDF
      </Menu.Item>
      <Menu.Item key="3" onClick={exportToNewPage}>
        Page
      </Menu.Item>
    </Menu>
  );
  
  // const addQuery = (nodes, edges, stance) => {
  //   // setIsDecompose(true)
  //   api.decomposeQuery(selectText, 0, stance).then(response=>{
  //     const parentNode = nodes[0]
  //     const response_data = response.data.data
  //     const { directionList, queryList } = response_data
  //     console.log('root addnode', directionList, queryList)
  //     // const newstance = stance == 'supportive' ? 'support' : 'oppose'
  //     const addPositions = BalloonLayout(nodes, edges, parentNode, stance, store.setNode, queryList.length)
  //     const res = store.addChildNode(parentNode, queryList, directionList, stance, addPositions)
  //     console.log('res1', res)
  //     return res
  //     // setIsDecompose(false)
  //   }).catch(error => {
  //     console.error(error)
  //     return {nodes: nodes, edges: []}
  //     // setIsDecompose(false)
  //   })
  // } 
  // }

  const addQuery = async (nodes, edges) => {
    try {
        const response = await api.decomposeQuery(selectText, 0, 'support');
        const response_data = response.data.data;
        const { directionList, queryList } = response_data;

        const response_oppose = await api.decomposeQuery(selectText, 0, 'oppose');
        const response_data_oppose = response_oppose.data.data;
        const { directionList: directionList_oppose, queryList: queryList_oppose } = response_data_oppose;

        const parentNode = nodes[0];
        const res = BalloonLayout(nodes, edges, parentNode, 'support', store.setNode, queryList.length);
        const res_oppose = BalloonLayout(nodes, edges, parentNode, 'oppose', store.setNode, queryList_oppose.length);

        const newQueryList = queryList.concat(queryList_oppose)
        const newDirectionList = directionList.concat(directionList_oppose)
        const newAddPositions = res.positions.concat(res_oppose.positions)

        store.addChildNodeForRoot(parentNode, newQueryList, newDirectionList, newAddPositions, queryList.length);
    } catch (error) {
        console.error(error);
    }
};
  const addQuery1 = (nodes, edges, stance) => {
    const parentNode = nodes[0]
    const addPositions = BalloonLayout(nodes, edges, parentNode, stance, store.setNode)
    
    const queryList = ["What is China's recent GDP growth rate",
    "How are China's major industries growing",
    "How are China's consumption and investment levels changing"]
    const queryThemeList = ['economy', 'operating and maintenance costs', 'supply side']
    // const newstance = stance == 'supportive' ? 'support' : 'oppose'
    const res = store.addChildNode(parentNode, queryList, queryThemeList, stance, addPositions)
    return res
  }

  const onAddStatement = async ()=>{
    // 1. 清除当前画布所有节点（或保存）
    if (store.nodes) {
      store.setNode([])
      store.setEdge([])  
    }

    // 2. 添加statement节点
    const nodes = store.addRootNode(selectText)

    // 3. 请求生成支持和否定的query
    store.setIsRootDecompose(true)
    await addQuery(nodes, [])
    store.setIsRootDecompose(false)
  }

  useEffect(() => {
    if (store.isRootDecompose) {
      setTimeout(() => {
        fitView();
      }, 200);
    }
  }, [store.nodes, store.isRootDecompose]);

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
            ref={reactQuillRef}
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
              onClick={onAddStatement}
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
