import React, { useState, useRef, useEffect } from 'react';
import { Button, Dropdown, Menu, Input, message } from 'antd';
import ReactQuill, { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';
import { saveAs } from 'file-saver';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import 'react-quill/dist/quill.snow.css';
import './Sidebar.css';
import jsPDF from 'jspdf';
import htmlDocx from 'html-docx-js/dist/html-docx';
import html2canvas from 'html2canvas';
import facts from '../../tools/demo';
import _ from 'lodash'
import { nanoid } from 'nanoid';

import saveIcon from '../../assets/save_icon.svg';
import exportIcon from '../../assets/export_icon.svg';
import editIcon from '../../assets/edit_icon.svg';
import planeIcon from '../../assets/plane_icon.svg'; 

import * as api from '../../axios/api'
import { BalloonLayout } from '../Mindmap/Layout/MDSLayout';
import { extract_Res, calcStanceAndRel, getColor } from '../../tools/helper';

import { useStore } from '../../store/store';

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
  const [filename, setFilename] = useState('')
  const editorRef = useRef(null);
  const reactQuillRef = useRef(null)
  const store = useStore()
  const { fitView } = useReactFlow();
  const [messageApi, contextHolder] = message.useMessage();

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
    // window.open(`/#/news/${store.pageId}`, '_blank');
    window.open(`/DataScout/#/news?id=${store.pageId}`, '_blank');
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
  
  const addQuery = async (nodes, edges) => {
    try {
        let newNodes = [], newNodes_oppose = []
        const parentNode = nodes[0];

        const [response1, response2] = await Promise.all([
          // api.decomposeAndRetrieveTest(selectText, selectText, 'support'),
          // api.decomposeAndRetrieveTest(selectText, selectText, 'oppose')
          api.decomposeAndRetrieve(selectText, selectText, 'support'),
          api.decomposeAndRetrieve(selectText, selectText, 'oppose')
        ]);
        console.log('res', response1, response2)

        const retrieveList = extract_Res(response1)
   
        let newRetrieveList = retrieveList.map(obj => {
          const facts = obj.facts
          const res = calcStanceAndRel(facts, 'support')
          if (res.stance?.label == 'support') {
            newNodes.push({ ...obj, relevance: res.relevance, stance: res.stance, scale: res.scale })
          } else {
            newNodes_oppose.push({ ...obj, relevance: res.relevance, stance: res.stance, scale: res.scale })
          }
          return { ...obj, relevance: res.relevance, stance: res.stance, scale: res.scale };
        });

        console.log('retrieve support', newRetrieveList)
        
        const retrieveList_oppose = extract_Res(response2)

        let newRetrieveList_oppose = retrieveList_oppose.map(obj => {
          const facts = obj.facts
          const res = calcStanceAndRel(facts, 'oppose')
          if (res.stance?.label == 'support') {
            newNodes.push({ ...obj, relevance: res.relevance, stance: res.stance, scale: res.scale })
          } else {
            newNodes_oppose.push({ ...obj, relevance: res.relevance, stance: res.stance, scale: res.scale })
          }
          return { ...obj, relevance: res.relevance, stance: res.stance, scale: res.scale };
        });
        
        console.log('retrieve oppose', newRetrieveList_oppose)

        // const res = BalloonLayout(nodes, edges, parentNode, 'support', store.setNode, newRetrieveList.length);
        // const res_oppose = BalloonLayout(nodes, edges, parentNode, 'oppose', store.setNode, newRetrieveList_oppose.length);

        // const addPositionsAll = res.positions.concat(res_oppose.positions)
        // const retrieveListAll = newRetrieveList.concat(newRetrieveList_oppose)
        // store.addChildNodeForRootAll(parentNode, retrieveListAll, addPositionsAll);
        
        const res = BalloonLayout(nodes, edges, parentNode, 'support', store.setNode, newNodes.length);
        const res_oppose = BalloonLayout(nodes, edges, parentNode, 'oppose', store.setNode, newNodes_oppose.length);

        const addPositionsAll = res.positions.concat(res_oppose.positions)
        const nodesAll = newNodes.concat(newNodes_oppose)

        store.addChildNodeForRootAll(parentNode, nodesAll, addPositionsAll);
    } catch (error) {
        console.error(error);
    }
};

  const addQueryDemo = (nodes, edges, stance) => {
    const parentNode = nodes[0]
    const res = BalloonLayout(nodes, edges, parentNode, 'support', store.setNode)
  
    const queryList = ["What is China's recent GDP growth rate",
    "How are China's major industries growing",
    "How are China's consumption and investment levels changing"]
    const queryThemeList = ['economy', 'operating and maintenance costs', 'supply side']
    let retrieveListAll = []
    for (let i=0; i<queryList.length; i++) {
      let recommend = i==0 ? true : false
      retrieveListAll.push({
        query: queryList[i],
        queryTheme: queryThemeList[i],
        stance: {label: 'support', score: 0.8},
        facts: _.cloneDeep(facts),
        recommend: recommend
      })
    }
    // const res = store.addChildNode(parentNode, queryList, queryThemeList, stance, addPositions)
    store.addChildNodeForRootAll(parentNode, retrieveListAll, res.positions);
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
    // addQueryDemo(nodes, store.edges, [])
    store.setIsRootDecompose(false)
  }

  const onSave = () => {
    const nodes = store.nodes
    const edges = store.edges
    const rootNode = nodes[0]
    const statement = rootNode.data.query, rootId = rootNode.id
    const userid = nanoid()
    api.storeFacts(statement, nodes, edges, rootId).then(response=>{
      messageApi.open({
        type: 'success',
        content: 'Save Successful',
      });
      console.log('save success')
    }).catch(error => {
      console.error(error)
    })
  }

  const onLoadAllNodes = () => {
    api.loadFacts(filename).then(response=>{
      const nodes = response.data.nodes
      const edges = response.data.edges
      console.log('load success', response, nodes, edges)
      const newEdges = edges.map(edge=>{
        const targetId = edge.target
        const node = nodes.filter((node)=>node.id==targetId)[0]
        if (node) {
          const color = getColor(node.data.stance)
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`
            }
          }
        } else {
          return edge
        }
      })

      store.setNode(nodes)
      store.setEdge(newEdges)


    }).catch(error => {
      console.error(error)
    })
  }

  useEffect(() => {
    if (store.isRootDecompose) {
      setTimeout(() => {
        fitView();
      }, 400);
    }
  }, [store.nodes, store.isRootDecompose]);

  return (
    <div className={`sidebar ${visible ? 'open' : ''}`}>
      {contextHolder}
      <Button className="toggle-btn" onClick={toggleDrawer}>
        {visible ? '<' : '>'}
      </Button>
      <div className="content">
        <div className="editor-header">
          <Input 
            className="input"
            placeholder="Please input the title of the story"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            prefix={<Button className="edit-btn" style={{ border: 'none', background: 'transparent' }}>
              <img src={editIcon} alt="edit" style={{ width: '10px', height: '10px' }} />
            </Button>}
          />
          <Button className="icon-btn">
            <img src={saveIcon} alt="save" className="icon" onClick={onSave}/>
          </Button>
          <Dropdown overlay={menu} placement="bottomRight">
            <Button className="icon-btn">
              <img src={exportIcon} alt="export" className="icon" />
            </Button>
          </Dropdown>
        </div>
        {/* <div style={{display: 'flex', flexDirection: 'row'}}>
          <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
          <Button onClick={onLoadAllNodes}>Load</Button>
        </div> */}
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
                width: '60px', 
                height: '60px', 
                borderRadius: '20%', 
              }}
              onClick={onAddStatement}
            >
              <img src={planeIcon} alt="plane" style={{ width: '28px', height: '28px' }} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
