import { Handle, Position, useReactFlow, getOutgoers } from 'reactflow';
import { useState } from 'react';
import { Button, Tooltip, Card, Spin, Input } from 'antd';
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import * as api from '../../../axios/api'
import { BalloonLayout } from '../Layout/MDSLayout';
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
  setNode: store.setNode
})
const { TextArea } = Input;

const hide = (hidden) => (nodeOrEdge) => {
  return {
    ...nodeOrEdge,
    hidden,
  };
};

function RootNode({ id, data }) {
  // const store = useStore(selector, shallow)
  const store = useStore()
  const { getEdges, getNodes } = useReactFlow();
  const [showBtn, setShowBtn] = useState(false)
  // const [isDecompose, setIsDecompose] = useState(false)
  const [value, setValue] = useState(data?.query || '')

  const handleChange = (e) => {
      setValue(e.target.value);
  };

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
    // 左右侧各自规整一遍
    BalloonLayout(newNodeList, parentNode, 'support', getNodes, getEdges, getOutgoers, store.setNode, 0)
    BalloonLayout(newNodeList, parentNode, 'oppose', getNodes, getEdges, getOutgoers, store.setNode, 0)
  }

  const onAddQuery = (stance) => {
    const parentNode = store.nodes.find((node) => node.id === id)
    store.setIsRootDecompose(true)
    api.decomposeQuery(data.query, 0, stance).then(response=>{
      const response_data = response.data.data
      const { directionList, queryList } = response_data
      console.log('root addnode', directionList, queryList)
      // const newstance = stance == 'supportive' ? 'support' : 'oppose'
      const addPositions = BalloonLayout(store.nodes, store.edges, parentNode, stance, store.setNode, queryList.length)
      store.addChildNode(parentNode, queryList, directionList, stance, addPositions)
      store.setIsRootDecompose(false)
    }).catch(error => {
      console.error(error)
      store.setIsRootDecompose(false)
    })
  }

  const onAddQuery2 = (stance) => {
    const parentNode = store.nodes.find((node) => node.id === id)
    const addPositions = BalloonLayout(store.nodes, store.edges, parentNode, stance, store.setNode)
    
    const queryList = ["What is China's recent GDP growth rate",
    "How are China's major industries growing",
    "How are China's consumption and investment levels changing"]
    const queryThemeList = ['economy', 'operating and maintenance costs', 'supply side']
    // const newstance = stance == 'supportive' ? 'support' : 'oppose'
    store.addChildNode(parentNode, queryList, queryThemeList, stance, addPositions)
  }

  return (
    <div className='rootnode-container' id='rootnode' onMouseEnter={()=>{setShowBtn(true)}} onMouseLeave={()=>{setShowBtn(false)}}>
      <Spin spinning={store.isRootDecompose} >
      <Tooltip placement="bottom" title={'Support'} color={'#fff'} overlayInnerStyle={{color: '#000'}}>
        <Button className='add-right' onClick={()=>{onAddQuery("support")}} type="primary" shape="circle" icon={<PlusOutlined/>} style={{color: '#7B6D64'}}/>
      </Tooltip>
      <div className={showBtn ? 'rootnode-btn' : 'rootnode-btn btn-opacity'}>
        {data.hiddeNum > 0 ? <Button onClick={expandChildNode} type="primary" shape="circle" size={'small'} style={{ border: '2px solid #7B6D64', color: '#7B6D64', height: '18px', width:'18px', minWidth:'0', fontSize: '11px' }}>{data.hiddeNum}</Button> : <div></div>}
      </div>
      <Card 
        hoverable
        style={{ width: 200, border: '4px solid #7B6D64', borderTop: '1px solid #7B6D64', borderRadius: '6px' }}
        title={<div className='rootnode-head'>{data.label}</div>}
      >
        {/* <TextArea autoSize={{ minRows: 2, maxRows: 2 }} value={value} onChange={handleChange}/> */}
        <p className='truncated'>{data.query}</p>
      </Card>

      <Tooltip placement="bottom" title={'Oppose'} color={'#fff'} overlayInnerStyle={{color: '#000'}}>
        <Button className='add-left' onClick={()=>{onAddQuery("oppose")}} type="primary" shape="circle" icon={<PlusOutlined/>} style={{color: '#7B6D64'}}/>
        </Tooltip>
      <Handle type="source" style={{opacity: 0}} position={Position.Right} />
      <Handle type="source" style={{opacity: 0}} position={Position.Left} />

      </Spin>
    </div>
  );
}
 
export default RootNode;