import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import { useStore } from '../../store/store';
import RootNode from './RootNode';
import QueryNode from './QueryNode';
import MindMapEdge from './MindMapEdge';
import { calFactsAndFieldsCnt } from '../../tools/helper';
import 'reactflow/dist/style.css';
import './Mindmap.css'; 


const nodeTypes = {
  rootnode: RootNode,
  querynode: QueryNode
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const MindMap = (props) => {
  const store = useStore();
  const [supportCnt, setSupportCnt] = useState({'facts':0, 'fields':0});
  const [opposeCnt, setOpposeCnt] = useState({'facts':0, 'fields':0});

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
    const rootNode = store.nodes[0]
    if (node.id == rootNode.id) {
      return
    }
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

  const handleNodesChange = () => {

  }

  useEffect(()=>{
    const res = calFactsAndFieldsCnt(store.nodes)
    setSupportCnt(res.support)
    setOpposeCnt(res.oppose)
  }, [store.nodes])

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
      {/* <div className='result-container'>
        <div className='result-support'>
          <div style={{width: '52px'}}>Support</div>
          <div style={{fontWeight:500, marginLeft: '6px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>Facts <div style={{fontSize: 10, verticalAlign: 'bottom'}}>(rel≥65%)</div></div>
          <div className='count-support'>{supportCnt.facts}</div>
          <div style={{fontWeight:500, marginLeft: '6px'}}>Fields</div>
          <div className='count-support'>{supportCnt.fields}</div>
        </div>
        <div className='result-oppose'>
          <div style={{width: '52px'}}>Oppose</div>
          <div style={{fontWeight:500, marginLeft: '6px', display: 'flex', flexDirection: 'row',  alignItems: 'center'}}>Facts <div style={{fontSize: 10}}>(rel≥65%)</div></div>
          <div className='count-oppose'>{opposeCnt.facts}</div>
          <div style={{fontWeight:500, marginLeft: '6px'}}>Fields</div>
          <div className='count-oppose'>{opposeCnt.fields}</div>
        </div>
      </div> */}
      <Background />
      <Controls />
      {/* <MiniMap /> */}
    </ReactFlow>
  );
};


export default MindMap;
