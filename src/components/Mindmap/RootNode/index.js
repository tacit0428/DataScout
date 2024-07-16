import { Handle, Position } from 'reactflow';
import { useState } from 'react';
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

function RootNode({ id, data }) {
  const store = useStore(selector, shallow)
  const [stance, setStance] = useState('support')

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
    store.addChildNode(parentNode, queryList)
  }

  return (
    <div className='rootnode-container'>

      <Card 
        hoverable
        style={{ width: 200, border: '4px solid #7B6D64', borderRadius: '7px' }}
        // title={<Tag color="#D8CEC8">{data.label}</Tag>}
        // title={<div style={{background: '#D8CEC8', height: '12px', borderRadius:'6px 6px 0px 0px'}}></div>}
      >
        <Tag color="#7B6D64">{data.label}</Tag>
        <p className='truncated'>{data.query}</p>
      </Card>
      
      <Handle type="source" position={Position.Right} onClick={onAddQuery}/>
      
      {/* <Popover overlayClassName={'ant-popover'} content={content} title="Stance" placement='right' overlayInnerStyle={{width:"150px"}}>
        <Button className="add-btn" shape="circle" size='small' icon={<PlusOutlined />} onClick={onAddQuery}></Button>
        <Handle type="source" position={Position.Right} onClick={onAddQuery}/>
      </Popover> */}
    </div>
  );
}
 
export default RootNode;