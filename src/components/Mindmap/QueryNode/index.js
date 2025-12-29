import { Handle, Position, useReactFlow, getOutgoers } from 'reactflow';
import { useState, useEffect, createRef } from 'react';
import { Button, Card, Spin } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import { BalloonLayout, stressMajorization } from '../Layout/MDSLayout';
import * as api from '../../../axios/api'
import { extract_Res, getColor, calcStanceAndRel } from '../../../tools/helper';
import { fact2chart } from '../../../tools/fact2vis';
import { isValid } from '../../../tools/helper';
import {
    MinusOutlined,
    CloseOutlined,
    ShrinkOutlined,
    PlusOutlined   
} from '@ant-design/icons';
 import './index.css'
 
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';
import FactType from '../../../constant/FactType';
import ChartType from '../../../constant/ChartType';


const hide = (hidden) => (nodeOrEdge) => {
    return {
      ...nodeOrEdge,
      hidden,
    };
};

function QueryNode({ id, data }) {
  const store = useStore();
  const [color, setColor] = useState({h: 170, s: 55, l: 55})
  const [borderWidth, setBorderWidth] = useState(1)
  const [shadowWidth, setShadowWidth] = useState(0)
  const [scale, setScale] = useState(1)
  const [showBtn, setShowBtn] = useState(true)
  const [chartName, setChartName] = useState('')
  const [cardContent, setCardContent] = useState(data.query)
  const [visBorder, setVisBorder] = useState(`1px solid hsla(${170}, ${55}%, ${55}%, 1)`)
  const [vis, setVis] = useState(null)
  const { getEdges, getNodes, deleteElements } = useReactFlow();

  const getChildNodes = (id, nodes=[], newHidde=false) => {
    const outgoers = getOutgoers({ id }, getNodes(), getEdges());
    if (outgoers.length) {
      outgoers.forEach((outgoer) => {
        if (newHidde) {
            if (!outgoer.hidden) {
                nodes.push(outgoer.id)
                getChildNodes(outgoer.id, nodes, newHidde);
            }
        } else {
            nodes.push(outgoer.id)
            getChildNodes(outgoer.id, nodes, newHidde);
        }
      });
    }
    return nodes
  }

  // 隐藏当前节点
  const hiddeNode = () => {
    const childNodes = getChildNodes(id)
    const childNodeNum = childNodes.length
    const parentNodeId  = data.parentNodeId
    let newNodeList = store.nodes.map((item)=>{
        if (item.id==id || childNodes.indexOf(item.id)!=-1) {
            return hide(true)(item)
        } else if (item.id == parentNodeId) {
            return {
                ...item,
                data: {
                    ...item.data,
                    hiddeNum: item.data.hiddeNum + childNodeNum + 1
                }
            }
        } else {
            return item
        }
    })
    store.setNode(newNodeList)
    // const parentNode = store.nodes.filter(item => item.id == parentNodeId)[0]
    // BalloonLayout(newNodeList, store.edges, parentNode, data.stance.label, store.setNode, 0)
  }

  // 隐藏所有子节点
  const hiddeChildNode = ()=>{
    const childNodes = getChildNodes(id, [], true)
    const childNodeNum = childNodes.length
    const newHiddeNum = data.hiddeNum + childNodeNum
    let newNodeList = store.nodes.map((item)=>{
        if (id == item.id) {
            return {
                ...item,
                data: {
                    ...item.data,
                    hiddeNum: newHiddeNum
                }
            }
        }
        if (childNodes.indexOf(item.id)!=-1) {
            return hide(true)(item)
        } else {
            return item
        }
    })
    store.setNode(newNodeList)
    // const parentNode = store.nodes.filter(item => item.id == id)[0]
    // BalloonLayout(newNodeList, store.edges, parentNode, data.stance.label, store.setNode, 0)
  }

  // 展开所有已隐藏的子节点
  const expandChildNode = ()=>{
    const childNodes = getChildNodes(id)
    let newNodeList = store.nodes.map((item)=>{
        if (childNodes.indexOf(item.id)!=-1) {
            return hide(false)(item)
        } else if (item.id == id) {
            return {
                ...item,
                data: {
                    ...item.data,
                    hiddeNum: 0
                }
            }
        } else {
            return item
        }
    })
    store.setNode(newNodeList)
    const parentNode = store.nodes.filter(item => item.id == id)[0]
    const {nodes, positions} = BalloonLayout(newNodeList, store.edges, parentNode, data.stance.label, store.setNode, 0)
    // 判断子节点里有没有观点相反的,有则需要进行layout
    const counterNodes = store.nodes.filter(node=>childNodes.indexOf(node.id)!=-1 && node.data.stance.label != data.stance.label)
    if (counterNodes.length) {
      console.log('counter', counterNodes[0].data.stance.label)
      BalloonLayout(nodes, store.edges, parentNode, counterNodes[0].data.stance.label, store.setNode, 0)
    }
  }

  const deleteNode = () => {
    const childNodes = getChildNodes(id)
    const currentNode = store.nodes.filter(item => item.id == id )
    const deleteNodes = store.nodes.filter(item => item.id == id || childNodes.indexOf(item.id)!=-1)
    deleteElements({ nodes: deleteNodes })
    const parentNode = store.nodes.filter(item => item.id == currentNode[0].parentNode)[0]
    const newNodes = store.nodes.filter(item => !deleteNodes.includes(item)) // store.nodes此时没有更新，需要手动更新
    if (store.showConfig && id == store.currentNode.id) {
      store.setShowConfig(false)
    }
    store.setNode(newNodes)
    // 当删除当前节点时，该节点的同层和子层需要调整，所以parentNode
    // BalloonLayout(newNodes, store.edges, parentNode, data.stance.label, store.setNode, 0)
  }

  const findChildNodes = (id, nodes, edges) => {
    const childEdges = edges.filter(edge=>edge.source == id)
    const childNodeIds = childEdges.map(edge => edge.target)
    const childNodes = nodes.filter(node=>childNodeIds.includes(node.id))
    return childNodes
}

  // 生成query并检索fact
  const onAddQuery = (stance) => {
    const parentNode = store.nodes.find((node) => node.id === id)
    const rootNode = store.nodes[0]
    // const childNodes = findChildNodes(id, store.nodes, store.edges)
    // let retrieve = childNodes.length ? true : false
    let retrieve = parentNode.retrieve ? true : false
    store.setSpinNodeId(id)
    // api.decomposeAndRetrieveTest(rootNode.data.query, data.query, stance, retrieve) 需要load已有数据时需要用这个
    api.decomposeAndRetrieve(rootNode.data.query, data.query, stance).then(response=>{
      const retrieveList = extract_Res(response)

      let newRetrieveList = retrieveList.map(obj => {
        const facts = obj.facts
        const res = calcStanceAndRel(facts, stance)
        return { ...obj, relevance: res.relevance, stance: res.stance, scale: res.scale };
      });
      console.log('retrievelist', newRetrieveList)
      const {nodes, positions} = BalloonLayout(store.nodes, store.edges, parentNode, stance, store.setNode, newRetrieveList.length)
      store.addChildNodeAll(parentNode, newRetrieveList, stance, positions)
      store.setSpinNodeId('')
    }).catch(error => {
      console.error(error)
      store.setSpinNodeId('')
    })
  }

  // 只生成query
  const onAddQuery1 = (stance) => {
    const parentNode = store.nodes.find((node) => node.id === id)
    store.setSpinNodeId(id)
    api.decomposeQuery(data.query, 0, stance).then(response=>{
      const response_data = response.data.data
      const { directionList, queryList } = response_data
      console.log('querynode add query', directionList, queryList)
      // const newstance = stance == 'supportive' ? 'support' : 'oppose'
      const res = BalloonLayout(store.nodes, store.edges, parentNode, stance, store.setNode, queryList.length)
      store.addChildNode(parentNode, queryList, directionList, stance, res.positions)
      store.setSpinNodeId('')
    }).catch(error => {
      console.error(error)
      store.setSpinNodeId('')
    })
  }

  const onAddQueryDemo = (stance) => {
    const parentNode = store.nodes.find((node) => node.id === id)
    const addPositions = BalloonLayout(store.nodes, store.edges, parentNode, stance, store.setNode)
    const queryList = ["What has been the growth rate of China's manufacturing industry over the past five years",
    "How has China's service industry expanded in terms of GDP contribution in recent years",
    "What are the key growth metrics for China's technology and innovation sectors in the last decade"]
    const queryThemeList = ['manufacturing industry', 'service industry', 'technology and innovation']
    // const newstance = stance == 'supportive' ? 'support' : 'oppose'
    store.addChildNode(parentNode, queryList, queryThemeList, stance, addPositions)
  }

  const onAddNews = () => {
    const quill = store.editorRef.current.getEditor();
    const range = quill.getSelection();
    const position = range ? range.index : quill.getLength() - 1
    const node = document.getElementById(`query-node-vis-${id}`).childNodes[0].childNodes[0]
    // let node = svgnode.cloneNode(true);

    const facts = data.facts
    let fact = facts.length > 0 ? facts[0].fact : null
    const topIndex = facts.findIndex(fact => fact.star === true);
    if (topIndex != -1) {
      fact = facts[topIndex].fact
    }

    if (node) {
        let serializer = new XMLSerializer()
        let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(node)
        let image = new Image()
        image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
        let canvas = document.createElement('canvas')
        let context = canvas.getContext('2d');
        let svgWidth = node.getAttribute('width')
        let svgHeight = node.getAttribute('height')
        
        // 设置 Canvas 尺寸
        canvas.width = svgWidth * window.devicePixelRatio;
        canvas.height = svgHeight * window.devicePixelRatio;
        canvas.style.width = `${svgWidth}px`;
        canvas.style.height = `${svgHeight}px`;
        // 设置高分辨率
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        image.onload = function () {
            context.drawImage(image, 0, 0, svgWidth, svgHeight)
            const imgurl = canvas.toDataURL(`image/${'.png'}`)   
            const img = `<img src="${imgurl}" alt="svg-image" />`
            quill.clipboard.dangerouslyPasteHTML(position, img)
            
            quill.insertText(position + 1, '\n');
            // 插入图片描述
            const caption = `<p>${fact.description}</p>`;
            quill.clipboard.dangerouslyPasteHTML(position + 2, caption);
        }
    }
  }

  useEffect(()=>{
    let color = getColor(data.stance)
    setColor(color)
    if (data.userselected) {
      setVisBorder(`1px solid hsla(${39}, ${99}%, ${63}%, 1)`)
    } else {
      setVisBorder(`1px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`)
    }
    
    if (data.recommend) {
      setBorderWidth(3)
      setShadowWidth(20)
    } else {
      setBorderWidth(1)
      setShadowWidth(0)
    }
    const node = store.nodes.filter((node)=>node.id==id)[0]
    if (node && node.scale) {
      setScale(node.scale)
    }
  }, [data.stance])

  useEffect(()=>{
    const facts = data.facts
    let defaultFact = facts.length > 0 ? facts[0] : null
    const topIndex = facts.findIndex(fact => fact.star === true);
    if (topIndex != -1) {
      defaultFact = facts[topIndex]
    }
    if (defaultFact.fact && isValid(defaultFact.fact)) {
        const tableData = defaultFact.table.data.rows
        const schema = defaultFact.table.data.schema
        const height = defaultFact.fact.chart == ChartType.ISOTYPE_BAR_CHART ? 150 : 160
        const newvis = fact2chart(id, defaultFact.fact, tableData, schema, 200, height, setChartName);
        setVis(newvis)
        setCardContent(defaultFact.fact.description)
    } 

    const adjustTextSize = () => {
      const div = document.getElementById(`query-${id}`);
      let fontSize = 14; // 初始字体大小
      let lineHeight = 1.5; // 初始行高
      const maxHeight = div.offsetHeight + 5; // 获取div的固定高度
  
      // 如果内容高度超出容器高度，则减小字体和行高
      while (div.scrollHeight > maxHeight && fontSize > 10) {
        fontSize -= 1;
        lineHeight -= 0.1;
        div.style.fontSize = fontSize + 'px';
        div.style.lineHeight = lineHeight;
      }
    };
  
    // adjustTextSize(); // 调整文字尺寸

}, [data.facts])

  return (
    <div className='querynode-container' id={`querynode-${id}`} style={{transform: `scale(${scale})`}} onMouseEnter={()=>{setShowBtn(true)}} onMouseLeave={()=>{setShowBtn(false)}}>
      <Spin spinning={id==store.spinNodeId} >
      <Button className={data.stance.label == 'support' ? 'right-btn': 'left-btn'} onClick={()=>{onAddQuery(data.stance.label)}} type="primary" shape="circle" size={'small'} icon={<PlusOutlined/>} style={{color: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, border: `2px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`}}/>
      {/* <Button className='left-btn' onClick={onAddQuery} type="primary" shape="circle" size={'small'} style={{color: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, border: `2px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`}}>12</Button> */}
      <div className={showBtn ? 'querynode-btn' : 'querynode-btn btn-opacity'}>
        {data.hiddeNum > 0 ? <Button onClick={expandChildNode} type="primary" shape="circle" size={'small'} style={{ border: `2px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, color: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, height: '18px', width:'18px', minWidth:'0', fontSize: '11px' }}>{data.hiddeNum}</Button> : <div></div>}
        <div>
            <Button onClick={hiddeNode} type="primary" shape="circle" size={'small'} icon={<MinusOutlined style={{color: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)` }}/>} style={{ border: `2px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, height: '18px', width:'18px', minWidth:'0' }} />
            <Button onClick={hiddeChildNode} type="primary" shape="circle" size={'small'} icon={<ShrinkOutlined style={{color: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)` }}/>} style={{ border: `2px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, height: '18px', width:'18px', minWidth:'0' }} />
            <Button onClick={deleteNode} type="primary" shape="circle" size={'small'} icon={<CloseOutlined style={{color: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)` }}/>} style={{ border: `2px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, height: '18px', width:'18px', minWidth:'0' }} />
        </div>
      </div>
      <Card 
        hoverable
        style={{ width: 200, border: `${borderWidth}px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, boxShadow: `0 0 ${shadowWidth}px hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`}}
        title={<div className='querynode-head' style={{background: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`}}>{data.label}</div>}
      >
        <div className='query-node-vis-container' style={{border: `${visBorder}`}}>
          <div id={`query-node-vis-${id}`} style={{transform: 'scale(0.8) translate(0, -15px)'}}>{vis}</div>
        </div>
        <div className='cardContent' id={`query-${id}`}>{data.query}</div>
        <Button className={showBtn ? 'addNewsBtn' : 'addNewsBtn-opacity'} onClick={onAddNews} type="link" icon={<FileAddOutlined style={{color: 'rgba(210, 210, 210, 1)'}}/>}/>
      </Card>
      
      <Handle type="source" style={{opacity: 0}} position={Position.Right} onClick={onAddQuery}/>
      <Handle type="target" style={{opacity: 0}} position={Position.Left} />
      </Spin>
    </div>
  );

}
 
export default QueryNode;