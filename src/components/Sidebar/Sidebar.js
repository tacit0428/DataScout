// Sidebar.js
import React from 'react';
import { Button } from 'antd';
import './Sidebar.css'; // 引入侧边栏的样式
import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  // addChildNode: store.addChildNode,
  addRootNode: store.addRootNode,
  addEdge: store.addEdge
})

const Sidebar = ({ visible, toggleDrawer }) => {
  const store = useStore(selector, shallow);

  return (
    <div className={`sidebar ${visible ? 'open' : ''}`}>
      <Button className="toggle-btn" onClick={toggleDrawer}>
        {visible ? '<' : '>'} {/* 根据侧边栏的可见状态切换箭头方向 */}
      </Button>
      {/* 侧边栏内容 */}
      <div className="content">
        <h2>侧边栏内容</h2>
        <p>这里是侧边栏的内容部分。</p>
      </div>
      <Button onClick={store.addRootNode}>Add Statement</Button>
    </div>
  );
};

export default Sidebar;
