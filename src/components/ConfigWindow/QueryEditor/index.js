import React, {useState, useRef, useEffect} from "react";
import { Button, Input } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import * as api from '../../../axios/api'
import './index.css'
import facts from "../../../tools/demo";
import { BalloonLayout } from "../../Mindmap/Layout/MDSLayout";
import _ from 'lodash';
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
    nodes: store.nodes,
    edges: store.edges,
    currentNode: store.currentNode,
    setNode: store.setNode,
    setEdge: store.setEdge
})

const { TextArea } = Input;

const QueryEditor = (props)=>{
    const store = useStore(selector, shallow)
    const [value, setValue] = useState(store.currentNode?.data?.query || '')

    const handleChange = (e) => {
        setValue(e.target.value);
        props.setIsRetrieved(false)
    };

    const retrieveByNewQuery = () => {
        const currentNodeId = store.currentNode.id
        const rootNode = store.nodes.filter((node)=>node.type=='rootnode')[0]
        const statement = rootNode.data.query
        const stance = store.currentNode?.data?.stance?.label
        props.setIsRetrieving(true)
        api.retrieveFacts(statement, value, stance).then(response=>{
            const response_data = response.data.data
            const { factList } = response_data
            console.log('retrieve facts', factList)
            props.setIsRetrieving(false)
            props.setIsRetrieved(true)

            if (factList && factList.length) {
            const newFactList = factList.sort((a, b) => {
                // 先根据 stance 排序，将 support 的项排在前面
                if (a.stance.label === stance && b.stance.label !== stance) {
                    return -1;
                }
                if (a.stance.label !== stance && b.stance.label === stance) {
                    return 1;
                }
                // 要根据stance相关性还是根据relevance排序呢
                return b.relevance - a.relevance;
            });
            const curStance = newFactList.length ? newFactList[0].stance.label : stance

            const newScale = newFactList.length > 0 ? 150/200 + newFactList[0].relevance * 0.5 : 1
            const container = document.getElementById(`querynode-${currentNodeId}`);
            const nodeHeight = container.offsetHeight, nodeWidth = container.offsetWidth
            const newPositionAbsolute = getNewPositionAbsolute(store.currentNode.positionAbsolute.x, 
                store.currentNode.positionAbsolute.y, nodeWidth, nodeHeight, newScale)
            
            const newNodes = store.nodes.map(node=>{
                if (node.id == currentNodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            query: value,
                            facts: newFactList,
                            stance: {
                                label: newFactList[0].stance.label,
                                score: newFactList[0].stance.score
                            },
                            relevance: newFactList[0].relevance
                            // 还要修改querytheme
                        },
                        scale: newScale,
                        positionAbsolute: {
                            x: newPositionAbsolute.newX,
                            y: newPositionAbsolute.newY
                        }
                    }
                } else {
                    return node
                }
            })
    
            let h, s, l
            if (newFactList[0].stance.label == 'support') {
                h = 170
                s = 85 - (1 - newFactList[0].stance.score) * (85-15)/0.5
                l = 20 + (1 - newFactList[0].stance.score) * (75-20)/0.5
            } else {
                h = 343
                s = 90 - (1 - newFactList[0].stance.score) * (90-15)/0.5
                l = 25 + (1 - newFactList[0].stance.score) * (80-25)/0.5
            }
    
            const newEdges = store.edges.map(edge=>{
                if (edge.target == currentNodeId) {
                    return {
                        ...edge,
                        style: {
                            ...edge.style,
                            stroke: `hsla(${h}, ${s}%, ${l}%, 1)`
                        }
                    }
                } else {
                    return edge
                }
            })
            store.setNode(newNodes)
            store.setEdge(newEdges)
    
            const parentNode = store.nodes.filter(item => item.id == store.currentNode.parentNode)[0]
    
            if (curStance !== stance) {
                // 当检索到的fact的立场与检索立场不同时，此时需要换边了
                const res = BalloonLayout(newNodes, store.edges, parentNode, curStance, store.setNode, 0)
                BalloonLayout(res.nodes, store.edges, parentNode, stance, store.setNode, 0)
            } else {
                BalloonLayout(newNodes, store.edges, parentNode, curStance, store.setNode, 0, false)
            }
            }
          }).catch(error => {
            console.error(error)
            props.setIsRetrieving(false)
            props.setIsRetrieved(true)
          })
    }

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

    const retrieveByNewQuery1 = ()=>{
        const currentNodeId = store.currentNode.id
        const stance = store.currentNode?.data?.stance?.label
        const factList = _.cloneDeep(facts)

        const newFactList = factList.sort((a, b) => {
            // 先根据 stance 排序，将 support 的项排在前面
            if (a.stance.label === stance && b.stance.label !== stance) {
                return -1;
            }
            if (a.stance.label !== stance && b.stance.label === stance) {
                return 1;
            }
            // 要根据stance相关性还是根据relevance排序呢
            return b.relevance - a.relevance;
        });

        // 根据fact的相关度，重新计算节点大小和位置等信息
        // const newScale = newFactList.length > 0 ? 1 - (1 - newFactList[0].relevance) * 0.5 : 1
        const newScale = newFactList.length > 0 ? 150/200 + newFactList[0].relevance * 0.5 : 1
        const container = document.getElementById(`querynode-${currentNodeId}`);
        const nodeHeight = container.offsetHeight, nodeWidth = container.offsetWidth
        const newPositionAbsolute = getNewPositionAbsolute(store.currentNode.positionAbsolute.x, 
            store.currentNode.positionAbsolute.y, nodeWidth, nodeHeight, newScale)
        const newNodes = store.nodes.map(node=>{
            if (node.id == currentNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        query: value,
                        facts: newFactList,
                        stance: {
                            label: newFactList[0].stance.label,
                            score: newFactList[0].stance.score
                        },
                        relevance: newFactList[0].relevance
                        // 还要修改querytheme
                    },
                    scale: newScale,
                    // scale: 1,
                    positionAbsolute: {
                        x: newPositionAbsolute.newX,
                        y: newPositionAbsolute.newY
                    }
                }
            } else {
                return node
            }
        })

        let h, s, l
        if (newFactList[0].stance.label == 'support') {
            h = 170
            s = 85 - (1 - newFactList[0].stance.score) * (85-15)/0.5
            l = 20 + (1 - newFactList[0].stance.score) * (75-20)/0.5
        } else {
            h = 343
            s = 90 - (1 - newFactList[0].stance.score) * (90-15)/0.5
            l = 25 + (1 - newFactList[0].stance.score) * (80-25)/0.5
        }

        const newEdges = store.edges.map(edge=>{
            if (edge.target == currentNodeId) {
                return {
                    ...edge,
                    style: {
                        ...edge.style,
                        stroke: `hsla(${h}, ${s}%, ${l}%, 1)`
                    }
                }
            } else {
                return edge
            }
        })
        store.setNode(newNodes)
        store.setEdge(newEdges)

        const parentNode = store.nodes.filter(item => item.id == store.currentNode.parentNode)[0]
        const curStance = newFactList.length ? newFactList[0].stance.label : stance

        if (curStance !== stance) {
            // 当检索到的fact的立场与检索立场不同时，此时需要换边了，
            const res = BalloonLayout(newNodes, store.edges, parentNode, curStance, store.setNode, 0)
            BalloonLayout(res.nodes, store.edges, parentNode, stance, store.setNode, 0)
        } else {
            BalloonLayout(newNodes, store.edges, parentNode, curStance, store.setNode, 0, false)
        }
    }

    useEffect(()=>{
        setValue(store.currentNode?.data?.query)
    },[store.currentNode?.data?.query])

    return (
        <div className="query-editor">
            {/* <div className="query-editor-header">
                <EditFilled style={{color: 'rgba(133, 140, 144, 1)'}}/>
                <div style={{marginLeft: '10px'}}>Query Editor</div>
            </div> */}
            <div className="query-editor-content">
                <div>{store.currentNode?.data?.label}</div>
                <div className="query-input">
                    <TextArea  autoSize={{ minRows: 2, maxRows: 2 }} value={value} onChange={handleChange} onMouseEnter={()=>{props.setIsFixed(true)}} onMouseLeave={()=>{props.setIsFixed(false)}}/>
                </div>
                <div className="retrieve-btn">
                    <Button className="retrieve-btn" onClick={retrieveByNewQuery} icon={<SearchOutlined />}>Retrieve</Button>
                </div>
            </div>
        </div>
    )
}

export default QueryEditor