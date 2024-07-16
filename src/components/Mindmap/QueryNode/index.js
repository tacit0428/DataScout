import { Handle, Position } from 'reactflow';
import { useState, useEffect } from 'react';
import { Button, Popover, Tag, Card, Radio } from 'antd';
import {
  PlusCircleOutlined,
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
  addEdge: store.addEdge
})

function QueryNode({ id, data }) {
  const store = useStore(selector, shallow)
  const [stance, setStance] = useState('support')
  const [color, setColor] = useState({h: 170, s: 0.15, l:0.75})

  const onStanceChange = (e) => {
    setStance(e.target.value)
  };

  const content = (
    <div>
        <Radio.Group defaultValue="support" onChange={onStanceChange}>
          <Radio.Button value="support">Supprt</Radio.Button>
          <Radio.Button value="refute">Refute</Radio.Button>
        </Radio.Group>
    </div>
  );

  const onAddQuery = () => {
    const parentNode = store.nodes.find((node) => node.id === id)
    const queryList = ['Analysis of factors affecting the high-speed rail economy',
    'High-speed rail ticket prices and operating and maintenance costs',
    'Reasons for the increase in high-speed rail ticket prices: supply side']
    store.addChildNode(parentNode, queryList, 1)
  }

  useEffect(()=>{
    if (data.stance.label == 'support') {
        // support为绿色
        setColor({
            h: 170,
            s: 85 - (1 - data.stance.score) * (85-15)/0.5,
            l: 20 + (1 - data.stance.score) * (75-20)/0.5
        })
    } else {
        // refute为红色
        setColor({
            h: 343,
            s: 90 - (1 - data.stance.score) * (90-15)/0.5,
            l: 25 + (1 - data.stance.score) * (80-25)/0.5
        })
    }
  }, [data.stance])

  return (
    <div className='rootnode-container'>
      <Card 
        hoverable
        style={{ width: 200, border: `1px solid hsla(${color.h}, ${color.s}%, ${color.l}%, 1)` }}
        // title={<Tag color="#C4788D">{data.label}</Tag>}
        title={<div style={{background: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`, height: '12px', borderRadius:'6px 6px 0px 0px'}}></div>}
      >
        <Tag color={`hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`}>{data.label}</Tag>
        <p className='truncated'>{data.query}</p>
      </Card>
      
      <Handle type="source" position={Position.Right} onClick={onAddQuery}/>
      <Handle type="target" position={Position.Left} />

      {/* <Popover overlayClassName={'ant-popover'} content={content} title="Stance" placement='right' overlayInnerStyle={{width:"150px"}}>
        <Button className="add-btn" shape="circle" size='small' icon={<PlusOutlined />} onClick={onAddQuery}></Button>
        <Handle type="source" position={Position.Right} onClick={onAddQuery}/>
        <Handle type="target" position={Position.Left} />
      </Popover> */}

    </div>
  );
}
 
export default QueryNode;