import { Handle, Position, useReactFlow, getOutgoers } from 'reactflow';
import { useState, useEffect } from 'react';
import { Button, Card, Spin } from 'antd';
import { BalloonLayout, stressMajorization } from '../Layout/MDSLayout';
import * as api from '../../../axios/api'
import {
    MinusOutlined,
    CloseOutlined,
    ShrinkOutlined,
    PlusOutlined   
} from '@ant-design/icons';
 import './index.css'
 
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addChildNode: store.addChildNode,
  addRootNode: store.addRootNode,
  addEdge: store.addEdge,
  currentNode: store.currentNode,
  setNode: store.setNode
})

const hide = (hidden) => (nodeOrEdge) => {
    return {
      ...nodeOrEdge,
      hidden,
    };
};

function QueryNode({ id, data }) {
  // const store = useStore(selector, shallow)
  const store = useStore();
  const [color, setColor] = useState({h: 170, s: 0.15, l:0.75})
  const [scale, setScale] = useState(1)
  const [showBtn, setShowBtn] = useState(false)
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
    const parentNode = store.nodes.filter(item => item.id == parentNodeId)[0]
    BalloonLayout(newNodeList, store.edges, parentNode, data.stance.label, store.setNode, 0)
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
    const parentNode = store.nodes.filter(item => item.id == id)[0]
    BalloonLayout(newNodeList, store.edges, parentNode, data.stance.label, store.setNode, 0)
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
    BalloonLayout(newNodeList, store.edges, parentNode, data.stance.label, store.setNode, 0)
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
    // 当删除当前节点时，该节点的同层和子层需要调整，所以parentNode
    BalloonLayout(newNodes, store.edges, parentNode, data.stance.label, store.setNode, 0)
  }

  const onAddQuery = (stance) => {
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

  const onAddQuery1 = (stance) => {
    const parentNode = store.nodes.find((node) => node.id === id)
    const addPositions = BalloonLayout(store.nodes, store.edges, parentNode, stance, store.setNode)
    const queryList = ["What has been the growth rate of China's manufacturing industry over the past five years",
    "How has China's service industry expanded in terms of GDP contribution in recent years",
    "What are the key growth metrics for China's technology and innovation sectors in the last decade"]
    const queryThemeList = ['manufacturing industry', 'service industry', 'technology and innovation']
    // const newstance = stance == 'supportive' ? 'support' : 'oppose'
    store.addChildNode(parentNode, queryList, queryThemeList, stance, addPositions)
  }


  useEffect(()=>{
    if (data.stance.label == 'support') {
        // support为绿色
        setColor({
            h: 170,
            s: data.facts ? 85 - (1 - data.stance.score) * (85-15)/0.5 : 40,
            l: data.facts ? 20 + (1 - data.stance.score) * (75-20)/0.5 : 70
        })
    } else {
        // refute为红色
        setColor({
            h: 343,
            s: data.facts ? 90 - (1 - data.stance.score) * (90-15)/0.5 : 50,
            l: data.facts ? 25 + (1 - data.stance.score) * (80-25)/0.5 : 70
        })
    }

    const node = store.nodes.filter((node)=>node.id==id)[0]
    if (node && node.scale) {
      setScale(node.scale)
    }
  }, [data.stance])


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
        style={{ width: 200, border: `1px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)` }}
        title={<div className='querynode-head' style={{background: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`}}>{data.label}</div>}
      >
        <div id={`query-node-vis-${id}`} style={{borderRadius: '5px', marginTop:'8px', width: '100%', borderColor: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`}}></div>
        <p className='truncated' id={`query-${id}`}>{data.query}</p>
      </Card>
      
      <Handle type="source" style={{opacity: 0}} position={Position.Right} onClick={onAddQuery}/>
      <Handle type="target" style={{opacity: 0}} position={Position.Left} />
      </Spin>
    </div>
  );

}
 
export default QueryNode;