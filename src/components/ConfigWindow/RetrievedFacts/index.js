import React, {useState, useRef, useEffect} from "react";
import { Button, Input, Collapse, Row, Col, Select, } from "antd";
import {
    EditFilled,
    CaretRightOutlined
  } from '@ant-design/icons';
import './index.css'
import EditorView from "./EditorView";
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  currentNode: store.currentNode
})

const itemDefaultStyle = {
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    border: '1px solid rgba(217, 217, 217, 1)'
};


const panelHeader = (relevance, stance) => {
    return (
        <div style={{display: "flex", justifyContent: "space-between", fontWeight: 500, fontSize: '14px'}}>
            <div>Relevance: {relevance*100}%</div>
            <div>Predicted Stance: {stance}</div>
        </div>
    )
}

const panelContent = ()=>{
    return (
        <div>
            <div className="fact-config">
                <div className="fact-config-header">Data Fact Configuration</div>
                <div className="fact-config-panel">
                    <EditorView />
                </div>
            </div>
            <div className="data-source">
                <div className="data-source-header">Data Source</div>
            </div>
            <div className="panel-footer">
                <Button>Add to News</Button>
            </div>
        </div>
    )
}

const RetrievedFacts = ()=>{
    const store = useStore(selector, shallow)
    const [items, setItems] = useState([])
    // const [activateKey, setActivateKey] = useState([])

    useEffect(()=>{
        const currentItems = store.currentNode.data.facts.map((fact, index)=>{
            return  {
                key: index,
                label: panelHeader(fact.relevance, fact.stance.label),
                children: panelContent(),
                style: itemDefaultStyle
            }
        })
        setItems(currentItems)
    },[store.currentNode])

    return (
        <div className="retrieved-facts">
            <div className="retrieved-facts-header">
                <EditFilled style={{color: 'rgba(133, 140, 144, 1)'}}/>
                <div style={{marginLeft: '10px'}}>Retrvieved Data Facts</div>
            </div>
            <div className="retrieved-facts-content">
                <Collapse 
                    items={items} 
                    bordered={false}
                    defaultActiveKey={['0']} 
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                />
            </div>
        </div>
    )
}

export default RetrievedFacts