import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import {
  getBezierPath,
  getEdgeCenter,
  getMarkerEnd,
} from 'react-flow-renderer';
import { getStraightPath, BaseEdge } from 'reactflow';
import { calcStanceAndRel, getColor } from '../../../tools/helper';
import { BalloonLayout } from '../Layout/MDSLayout';
import planeIcon from '../../../assets/plane_icon.svg';
import * as api from '../../../axios/api'
import { useStore } from '../../../store/store';
import './index.css';

const foreignObjectSize = 215;

export default function MindMapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType,
  markerEndId,
}) {
  const store = useStore()
  const [edgePath] = getStraightPath({
    sourceX: sourceX-104,
    sourceY,
    targetX: targetX+102,
    targetY,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [searchVisible, setSearchVisible] = useState(false)
  const [inputwidth, setinputWidth] = useState(50);
  const inputRef = useRef(null)

  const onChange = (e) => {
    let length = e.target.value.length;
    if (length === 0) {
      setinputWidth(50);
    }
    setinputWidth(20 + length * 8);
  };

  const getNewPositionAbsolute = (x, y, width, height, scaleFactor) => {
    // Step 1: Calculate the center of the rectangle
    let centerX = x + width / 2;
    let centerY = y + height / 2;

    // Step 2: Calculate the new width and height
    let newWidth = width * scaleFactor;
    let newHeight = height * scaleFactor;

    // Step 3: Calculate the new top-left corner coordinates
    let newX = centerX - newWidth / 2;
    let newY = centerY - newHeight / 2;

    return { newX, newY };
  } 

  const onGenerateNewQueryAndRetrieve = () => {
    const keyword = inputRef.current.input.value
    const statement = store.nodes[0].data.query
    const currentEdge = store.edges.filter((edge)=>edge.id == id)[0]
    const currentNode = store.nodes.filter((node)=>node.id == currentEdge.target)[0]
    const currentNodeId = currentNode.id
    const stance = currentNode.data.stance.label
    store.setSpinNodeId(currentNodeId)
    api.generateQueryAndRetrieve(statement, stance, keyword).then(response=>{
      const response_data = response.data.data
      const { query, factList } = response_data
      if (factList && factList.length) {
        const res = calcStanceAndRel(factList, stance)
        const container = document.getElementById(`querynode-${currentNodeId}`);
        const nodeHeight = container.offsetHeight, nodeWidth = container.offsetWidth
        const newPositionAbsolute = getNewPositionAbsolute(store.currentNode.positionAbsolute.x, 
            store.currentNode.positionAbsolute.y, nodeWidth, nodeHeight, res.scale)
        
        const newNodes = store.nodes.map(node=>{
            if (node.id == currentNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        query: query,
                        facts: factList,
                        stance: res.stance,
                        relevance: res.relevance,
                        queryTheme: keyword
                    },
                    scale: res.scale,
                    positionAbsolute: {
                        x: newPositionAbsolute.newX,
                        y: newPositionAbsolute.newY
                    }
                }
            } else {
                return node
            }
        })

        const color = getColor(res.stance)
        const newEdges = store.edges.map(edge=>{
            if (edge.target == currentNodeId) {
                return {
                    ...edge,
                    style: {
                        ...edge.style,
                        stroke: `hsla(${color.h}, ${color.s}%, ${color.l}%, 1)`
                    }
                }
            } else {
                return edge
            }
        })
        store.setNode(newNodes)
        store.setEdge(newEdges)

        const parentNode = store.nodes.filter(item => item.id == store.currentNode.parentNode)[0]
        const curStance = res.stance.label
        if (curStance !== stance) {
            // 当检索到的fact的立场与检索立场不同时，此时需要换边了
            const res = BalloonLayout(newNodes, store.edges, parentNode, curStance, store.setNode, 0)
            BalloonLayout(res.nodes, store.edges, parentNode, stance, store.setNode, 0)
        } 
      }
      store.setSpinNodeId('')
    }).catch(error => {
      console.error(error)
      store.setSpinNodeId('')
    })
  }

  const onGenerateNewQuery = ()=>{
    const keyword = inputRef.current.input.value
    const statement = store.nodes[0].data.query
    const currentEdge = store.edges.filter((edge)=>edge.id == id)[0]
    const currentNode = store.nodes.filter((node)=>node.id == currentEdge.target)[0]
    const stance = currentNode.data.stance.label
    store.setSpinNodeId(currentNode.id)
    api.generateQuery(statement, stance, keyword).then(response=>{
      const response_data = response.data.data
      const { query: newQuery } = response_data
      const newNodes = store.nodes.map((node)=>{
        if (node.id == currentNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              query: newQuery,
              queryTheme: keyword,
              facts: null 
            }
          }
        } else {
          return node
        }
      })
      store.setNode(newNodes)
      store.setSpinNodeId('')
    }).catch(error => {
      console.error(error)
      store.setSpinNodeId('')
    })
  }

  const onChangeTheme = () => {
    const keyword = inputRef.current.input.value
    const currentNodeId = store.currentNode.id
    const newEdges = store.edges.map(edge=>{
      if (edge.target == currentNodeId) {
          return {
              ...edge,
              data: {
                queryTheme: keyword
              }
          }
      } else {
          return edge
      }
    })
    store.setEdge(newEdges)
  }

  useEffect(() => {
    if (inputRef.current) {
      const length = inputRef.current.input.value.length;
      setinputWidth(20 + length * 8)
    }
  }, []);

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"

      >
        <div className='edge-input-container' onMouseLeave={()=>{setSearchVisible(false)}}>
          <Input ref={inputRef} className='edge-input' defaultValue={data.queryTheme} onChange={onChange} onMouseEnter={()=>{setSearchVisible(true)}} style={{width: inputwidth}}/>
          <Button className='edge-btn' style={{display: searchVisible? 'flex' : 'none'}} onClick={onChangeTheme}>
            <img src={planeIcon} alt="plane" style={{ width: '18px', height: '18px' }} />
          </Button>
        </div>
      </foreignObject>
    </>
  );
}