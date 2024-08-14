import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import {
  getBezierPath,
  getEdgeCenter,
  getMarkerEnd,
} from 'react-flow-renderer';
import { getStraightPath, BaseEdge } from 'reactflow';
import planeIcon from '../../../assets/plane_icon.svg';
import * as api from '../../../axios/api'
import { useStore } from '../../../store/store';
import './index.css';

const foreignObjectSize = 180;

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
    setinputWidth(50 + length * 5);
  };

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

  useEffect(() => {
    if (inputRef.current) {
      const length = inputRef.current.input.value.length;
      setinputWidth(50 + length * 5)
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
          <Button className='edge-btn' style={{display: searchVisible? 'flex' : 'none'}} onClick={onGenerateNewQuery}>
            <img src={planeIcon} alt="plane" style={{ width: '18px', height: '18px' }} />
          </Button>
        </div>
      </foreignObject>
    </>
  );
}