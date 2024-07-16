import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
 
export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  currentNode: null,
 
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

  addRootNode() {
    const rootNode = {
        id: nanoid(),
        type: 'rootnode',
        data: { 
            label: 'Statement', 
            query: 'The increase in high-speed rail ticket prices is reasonable',
            layer: 0 
        },
        position: { x: 0, y: 0 }
    };
    set({
        nodes: [...get().nodes, rootNode],
    });
  },
 
  addChildNode(parentNode, queryList) {
    const newNodeList = queryList.map((item, index)=>{
        return {
            id: nanoid(),
            type: 'querynode',
            data: { 
                label: `Query ${parentNode.data.layer+1}-${index+1}`, 
                query: item, 
                layer:parentNode.data.layer+1, 
                stance: {label: 'support', score: 0.5 + index/10},
                facts: [{
                    stance: {label: 'support', score: 0.5 + index/10},
                    relevance: 0.4,
                    fact: 'fact1'
                },{
                    stance: {label: 'support', score: 0.5 + index/10},
                    relevance: 0.3,
                    fact: 'fact2'
                },
                ]
            },
            position: {x: 300, y:  parentNode.height/2-(2*queryList.length - 1)*parentNode.height / 2 + 2 * index * parentNode.height},
            parentNode: parentNode.id,
        }
    })

    const newEdgeList = newNodeList.map(newNode =>{
        return {
            id: nanoid(),
            source: parentNode.id,
            target: newNode.id,
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
  }
}));