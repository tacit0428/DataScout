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

// const Mindmap = ({ visible }) => {
//   const flowRef = useRef(null); // 引用 flow 容器
//   const [nodes, setNodes] = useState([
//     {
//       id: '1',
//       data: { label: 'statement' },
//       position: { x: 0, y: 0 },
//       type: 'input',
//     },
//     {
//       id: '2',
//       data: { label: 'query1' },
//       position: { x: 600, y: 500 },
//     },
//     {
//       id: '3',
//       data: { label: 'query2' },
//       position: { x: 600, y: 400 },
//     },
//   ]);

//   const edges = [
//     { id: '1-2', source: '1', target: '2' },
//     { id: '1-3', source: '1', target: '3' },
//   ];

//   const updateNodePosition = useCallback(() => {
//     if (flowRef.current) {
//       const { clientWidth, clientHeight } = flowRef.current;
//       setNodes((nodes) =>
//         nodes.map((node) =>
//           node.id === '1'
//             ? {
//                 ...node,
//                 position: {
//                   x: clientWidth / 2 - 50, // 假设节点宽度为 100
//                   y: clientHeight / 2 - 25, // 假设节点高度为 50
//                 },
//               }
//             : node
//         )
//       );
//     }
//   }, [flowRef]);

//   useEffect(() => {
//     updateNodePosition(); // 初次加载时更新节点位置

//     const resizeObserver = new ResizeObserver(() => {
//       updateNodePosition();
//     });

//     if (flowRef.current) {
//       resizeObserver.observe(flowRef.current);
//     }

//     return () => {
//       if (flowRef.current) {
//         resizeObserver.unobserve(flowRef.current);
//       }
//     };
//   }, [flowRef, updateNodePosition]);

//   const flowStyles = {
//     height: '92%',
//     border: '1px solid #ddd',
//     borderRadius: '4px',
//     overflow: 'hidden',
//   };

//   return (
//     <div className={`main-content ${visible ? 'shifted' : ''}`}>
//       <div style={flowStyles} ref={flowRef}>
//         {/* 在这里渲染 React Flow 组件 */}
//         <ReactFlow nodes={nodes} edges={edges} nodesDraggable={true}>
//           <Background />
//           <Controls />
//         </ReactFlow>
//       </div>
//     </div>
//   );
// };

// const nodeDefaults = {
//   sourcePosition: Position.Right,
//   targetPosition: Position.Left,
// };

// const initialNodes = [
//   {
//     id: '1',
//     position: { x: 0, y: 150 },
//     data: { label: 'default style 1' },
//     ...nodeDefaults,
//   },
//   {
//     id: '2',
//     position: { x: 250, y: 0 },
//     data: { label: 'default style 2' },
//     ...nodeDefaults,
//   },
//   {
//     id: '3',
//     position: { x: 250, y: 150 },
//     data: { label: 'default style 3' },
//     ...nodeDefaults,
//   },
//   {
//     id: '4',
//     position: { x: 250, y: 300 },
//     data: { label: 'default style 4' },
//     ...nodeDefaults,
//   },
// ];

// const initialEdges = [
//   {
//     id: 'e1-2',
//     source: '1',
//     target: '2',
//     animated: true,
//   },
//   {
//     id: 'e1-3',
//     source: '1',
//     target: '3',
//   },
//   {
//     id: 'e1-4',
//     source: '1',
//     target: '4',
//   },
// ];

const MindMap = (props) => {
  const store = useStore(selector, shallow);

  const onNodeClick = (event, node)=>{
    props.toggleConfig()
    store.setCurrentNode(node)
  }

  return (
    // <div className={`main-content ${visible ? 'shifted' : ''}`}>
    //   <ReactFlow
    //     nodes={store.nodes}
    //     edges={store.edges}
    //     nodeTypes={nodeTypes}
    //     onNodesChange={store.onNodesChange}
    //     onEdgesChange={store.onEdgesChange}
    //     onConnect={store.addEdge}
    //     onDoubleClick={()=>{console.log('double')}}
    //     fitView
    //   >
    //     <Background />
    //     <Controls />
    //     <MiniMap />
    //   </ReactFlow>
    //   {/* <ConfigWindow/> */}
    // </div>
    <ReactFlow
      nodes={store.nodes}
      edges={store.edges}
      nodeTypes={nodeTypes}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onConnect={store.addEdge}
      onNodeDoubleClick={onNodeClick}
      fitView
    >
      <Background />
      <Controls />
      {/* <MiniMap /> */}
    </ReactFlow>
  );
};


export default MindMap;
