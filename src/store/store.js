import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { forceSimulation, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import facts from '../tools/demo';
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash';
 
export const useStore = create((set, get) => ({
  pageId: uuidv4(),
  nodes: [],
  edges: [],
  currentNode: null,
  editorRef: null,
  showConfig: false, // 是否打开窗口
  isRootDecompose: false,
  // initialNodes: false,
  spinNodeId: '',
 
  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
 
  onEdgesChange(changes) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  addRootNode(query) {
    const rootNode = {
        id: nanoid(),
        type: 'rootnode',
        data: { 
            label: 'Statement', 
            query: query,
            layer: 0,
            hiddeNum: 0 
        },
        position: { x: 0, y: 0 },
        positionAbsolute: { x: 0, y: 0 },
        scale: 1
    };
    set({
        nodes: [...get().nodes, rootNode],
    });

    const updatedNodes = get().nodes;
    return updatedNodes
  },
 
  addChildNode(parentNode, queryList, queryThemeList, stance='support', addPositions=[]) {
    const newNodeList = queryList.map((item, index)=>{
        return {
            id: addPositions[index].id,
            type: 'querynode',
            data: { 
                label: parentNode.type == 'rootnode' ? `Query ${addPositions[index].layerIndex}` : `${parentNode.data.label}-${addPositions[index].layerIndex}`, 
                // label: `Query ${parentNode.data.layer+1}-${addPositions[index].layerIndex}`, 
                query: item, 
                queryTheme: queryThemeList[index], 
                layer:parentNode.data.layer+1, 
                stance: {label: stance, score: 1},
                // facts: _.cloneDeep(facts),
                facts: null,
                hiddeNum: 0,
                parentNodeId: parentNode.id,
            },
            // position: {x: stance=='support' ? 400 :-400, y:  parentNode.height/2-(2*queryList.length - 1)*parentNode.height / 2 + 4 * index * parentNode.height},
            position: addPositions[index].position,
            positionAbsolute: addPositions[index].positionAbsolute,
            parentNode: parentNode.id,
            angles: addPositions[index].angles,
            radius: addPositions[index].radius,
            layerIndex: addPositions[index].layerIndex,
            showVis: false,
            scale: 1
        }
    })

    const newEdgeList = newNodeList.map(newNode =>{
        let h, s, l, strokeWidth
        if (newNode.data?.stance?.label == 'support') {
            // support为绿色
            h = 170
            // s = 85 - (1 - newNode.data?.stance?.score) * (85-15)/0.5
            // l = 20 + (1 - newNode.data?.stance?.score) * (75-20)/0.5
            s = 40
            l = 70
        } else {
            // refute为红色
            h = 343
            // s = 90 - (1 - newNode.data?.stance?.score) * (90-15)/0.5
            // l = 25 + (1 - newNode.data?.stance?.score) * (80-25)/0.5
            s = 50
            l = 70
        }
        strokeWidth = Math.max(12 / newNode.data?.layer, 2)
        return {
            id: nanoid(),
            type: 'mindmap',
            source: parentNode.id,
            target: newNode.id,
            style: {
                strokeWidth: strokeWidth,
                stroke: `hsla(${h}, ${s}%, ${l}%, 1)`,
            },
            data: {
                queryTheme: newNode.data?.queryTheme
            }
        }
    })
    
    const nodes = [...get().nodes, ...newNodeList]
    const newNodes = nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: 1,
      }
    }))

    const edges = [...get().edges, ...newEdgeList]
    const newEdges = edges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: 1,
      }
    }))

    set({
      nodes: newNodes,
      edges: newEdges,
    });

    // set({
    //   nodes: [...get().nodes, ...newNodeList],
    //   edges: [...get().edges, ...newEdgeList],
    // });

  // console.log('updated', updatedNodes)
  // const nodesForSimulation = updatedNodes.map(node => ({
  //   ...node,
  //   // x: node.positionAbsolute?.x || node.position.x,
  //   // y: node.positionAbsolute?.y || node.position.y
  //   x: node.positionAbsolute.x ,
  //   y: node.positionAbsolute.y 
  // }));
  // console.log('nodesfor', nodesForSimulation)
  // const simulation = forceSimulation(nodesForSimulation)
  //     .force('charge', forceManyBody().strength(-10))
  //     .force('center', forceCenter(0, 0))
  //     .force('collision', forceCollide().radius(d => {
  //         return Math.sqrt(200** 2 + 65 ** 2) / 2 + 20
  //     }))
  //     .on('tick', () => {
  //         updatedNodes.forEach(node => {
  //           const newPosition = nodesForSimulation.find(pos => pos.id === node.id);
  //           const angle = Math.atan2(node.position.y, node.position.x)
  //           // if (Math.abs(angle - newPosition.angle)<Math.PI/3) {
  //           //   node.position.x = newPosition.x;
  //           //   node.position.y = newPosition.y;
  //           // }
  //           const parentNode = updatedNodes.find((node2)=>node2.id==node.parentNode)
  //           if (parentNode) {
  //             const relativeX = newPosition.x - parentNode.positionAbsolute.x;
  //             const relativeY = newPosition.y - parentNode.positionAbsolute.y;
  //             const newAngle = Math.atan2(relativeY, relativeX)
  //             if (Math.abs(angle - newAngle)<Math.PI/3) {
  //               node.position.x = relativeX;
  //               node.position.y = relativeY;
  //               node.positionAbsolute.x = newPosition.x;
  //               node.positionAbsolute.y = newPosition.y;
  //             }
  //         }
  //           // node.position.x = newPosition.x ;
  //           // node.position.y = newPosition.y;
  //         });
          
  //         set({
  //           nodes: [...updatedNodes],
  //         });
  //     });

  //     simulation.alpha(1).alphaDecay(0.08).restart()
  },

  // 添加root节点时，添加第一层子节点
  addChildNodeForRoot(parentNode, queryList, queryThemeList, addPositions, pivot) {
    const newNodeList = queryList.map((item, index)=>{
        return {
            id: addPositions[index].id,
            type: 'querynode',
            data: { 
                label: `Query ${index+1}`, 
                query: item, 
                queryTheme: queryThemeList[index], 
                layer:parentNode.data.layer+1, 
                stance: {label: index < pivot ? 'support' : 'oppose', score: 1},
                facts: null,
                hiddeNum: 0,
                parentNodeId: parentNode.id,
            },
            position: addPositions[index].position,
            positionAbsolute: addPositions[index].positionAbsolute,
            parentNode: parentNode.id,
            angles: addPositions[index].angles,
            radius: addPositions[index].radius,
            layerIndex: index+1,
            showVis: false,
            scale: 1
        }
    })

    const newEdgeList = newNodeList.map(newNode =>{
        let h, s, l, strokeWidth
        if (newNode.data?.stance?.label == 'support') {
            // support为绿色
            h = 170
            s = 40
            l = 70
        } else {
            // refute为红色
            h = 343
            s = 50
            l = 70
        }
        strokeWidth = Math.max(12 / newNode.data?.layer, 2)
        return {
            id: nanoid(),
            type: 'mindmap',
            source: parentNode.id,
            target: newNode.id,
            style: {
                strokeWidth: strokeWidth,
                stroke: `hsla(${h}, ${s}%, ${l}%, 1)`,
            },
            data: {
                queryTheme: newNode.data?.queryTheme
            }
        }
    })
    
    set({
      nodes: [...get().nodes, ...newNodeList],
      edges: [...get().edges, ...newEdgeList],
    });

  },

  addEdge(data) {
    const id = nanoid();
    const edge = { id, ...data };
    set({ edges: [edge, ...get().edges] });
  },

  setCurrentNode(node) {
    set({
        currentNode: node
    })
  },

  setNode(nodes) {
    const newCurrentNode = nodes.find(node=>node.id==get().currentNode?.id)
    set({
        nodes: [...nodes],
        currentNode: newCurrentNode
    });
  },

  setEdge(edges) {
    set({
      edges: [...edges]
    })
  },

  setEditorRef(ref) {
    set({
        editorRef: ref
    })
  },

  setShowConfig(show) {
    set({
      showConfig: show
    })
  },

  setIsRootDecompose(isDecompose) {
    set({
      isRootDecompose: isDecompose
    })
  },

  // setInitialNodes(initial) {
  //   set({
  //     initialNodes: initial
  //   })
  // },

  setSpinNodeId(id) {
    set({
      spinNodeId: id
    })
  }
}));