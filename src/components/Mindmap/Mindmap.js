import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
} from 'reactflow';
import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';
import RootNode from './RootNode';
import QueryNode from './QueryNode';
import MindMapEdge from './MindMapEdge';
import 'reactflow/dist/style.css';
import './Mindmap.css'; 

const selector = (store) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
  setCurrentNode: store.setCurrentNode
})

const nodeTypes = {
  rootnode: RootNode,
  querynode: QueryNode
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const MindMap = (props) => {
  const store = useStore();
  const [selectedNode, setSelectedNode] = useState();
  const [highlightedEdges, setHighlightedEdges] = useState([]);

  const onNodeClick = (event, node)=>{
    if (node.type == 'querynode') {
      store.setShowConfig(true)
    }
    store.setCurrentNode(node)
  }

  const getPathToRoot = (nodeId, edges) => {
    const path = [];
    let currentNodeId = nodeId;
  
    while (currentNodeId) {
      const edge = edges.find(e => e.target === currentNodeId);
      if (edge) {
        path.push(edge);
        currentNodeId = edge.source;
      } else {
        currentNodeId = null;
      }
    }
  
    return path;
  };

  const handleMouseEnter = (event, node) => {
    const pathToRoot = getPathToRoot(node.id, store.edges);
    const highlightEdges = pathToRoot.map(edge => edge.id);

    const newNodes = store.nodes.map(n =>
      pathToRoot.some(edge => edge.source === n.id || edge.target === n.id)
      ? { ...n, style: { opacity: 1 } }
      : { ...n, style: { opacity: 0.5 } }
    )
    store.setNode(newNodes);
    
    const newEdges = store.edges.map(e=>highlightEdges.includes(e.id)
           ? { ...e, style: { ...e.style, opacity: 1 } }
          : { ...e, style: { ...e.style, opacity: 0.2 } }
    )
    store.setEdge(newEdges)
  };

  const handleMouseLeave = () => {
    const newNodes = store.nodes.map(n=> ({ ...n, style: { opacity: 1 } }))
    const newEdges = store.edges.map(e=> ({ ...e, style: { ...e.style, opacity: 1 } }))
    store.setNode(newNodes);
    store.setEdge(newEdges);
  };

  return (
    <ReactFlow
      nodes={store.nodes}
      edges={store.edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onNodeMouseEnter={handleMouseEnter}
      onNodeMouseLeave={handleMouseLeave}
      onConnect={store.addEdge}
      onNodeDoubleClick={onNodeClick}
      fitView={true}
    >
      <Background />
      <Controls />
      {/* <MiniMap /> */}
    </ReactFlow>
  );
};


export default MindMap;
