import React, {useState, useRef, useEffect} from "react";
import { Button, Input } from "antd";
import {
    EditFilled,
    SearchOutlined
  } from '@ant-design/icons';
import './index.css'
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  currentNode: store.currentNode
})

const { TextArea } = Input;

const QueryEditor = ()=>{
    const store = useStore(selector, shallow)

    return (
        <div className="query-editor">
            <div className="query-editor-header">
                <EditFilled style={{color: 'rgba(133, 140, 144, 1)'}}/>
                <div style={{marginLeft: '10px'}}>Query Editor</div>
            </div>
            <div className="query-editor-content">
                <div>{store.currentNode.data.label}</div>
                <div className="query-input">
                    <TextArea  autoSize={{ minRows: 2, maxRows: 2 }} defaultValue={store.currentNode.data.query}/>
                </div>
                <div className="retrieve-btn">
                    <Button className="retrieve-btn" icon={<SearchOutlined />}>Retrieve</Button>
                </div>
            </div>
        </div>
    )
}

export default QueryEditor