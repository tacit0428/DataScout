import React, {useState, useRef, useEffect} from "react";
import { Button, Table, Collapse, Pagination, Spin } from "antd";
import { CaretRightOutlined } from '@ant-design/icons';
import EditorView from "./EditorView";
import blank1 from '../../../assets/blank1.png'
import blank2 from '../../../assets/blank2.png'
import './index.css'

import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  currentNode: store.currentNode,
  editorRef: store.editorRef
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
            <div>Relevance: {(relevance * 100).toFixed(2)}%</div>
            <div>Stance: {stance}</div>
        </div>
    )
}

const PanelContent = ({fact, table, factIndex, star, nodeId, editorRef, setIsFixed})=>{
    const store = useStore();
    const [chartName, setChartName] = useState('')
    const data = table.data

    // table name格式化
    let tableName = table.name
    tableName = tableName.replace(/_/g, ' ');
    const firstLetter = tableName.charAt(0)
    const firstLetterCap = firstLetter.toUpperCase()
    const remainingLetters = tableName.slice(1)
    tableName = firstLetterCap + remainingLetters

    const getChartName = (name)=>{
        setChartName(name)
        let factList = store.currentNode.data.facts
        let newFactList = factList.map((fact, index)=>{
            if (index == factIndex) {
                return {
                    ...fact,
                    chartName: name
                }
            } else {
                return fact
            }
        })
        const newNodes = store.nodes.map((node)=>{
            if (node.id == store.currentNode.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        facts: newFactList
                    }
                }
            } else {
                return node
            }
        })
        store.setNode(newNodes)
    }

    const insertChart = ()=>{
        const quill = editorRef.current.getEditor();
        const range = quill.getSelection();
        const position = range ? range.index : quill.getLength() - 1
        const node = document.getElementsByClassName(chartName)[0].childNodes[0]
    
        if (node) {
            let serializer = new XMLSerializer()
            let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(node)
            let image = new Image()
            image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d');
            // 获取 SVG 的原始尺寸
            // let svgWidth = node.getBBox().width;
            // let svgHeight = node.getBBox().height;

            let svgWidth = node.getAttribute('width')
            let svgHeight = node.getAttribute('height')
            
            // 设置 Canvas 尺寸
            canvas.width = svgWidth * window.devicePixelRatio;
            canvas.height = svgHeight * window.devicePixelRatio;
            canvas.style.width = `${svgWidth}px`;
            canvas.style.height = `${svgHeight}px`;
            // 设置高分辨率
            context.scale(window.devicePixelRatio, window.devicePixelRatio);
            context.fillStyle = '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            image.onload = function () {
                context.drawImage(image, 0, 0, svgWidth, svgHeight)
                const imgurl = canvas.toDataURL(`image/${'.png'}`)   
                const img = `<img src="${imgurl}" alt="svg-image" />`
                quill.clipboard.dangerouslyPasteHTML(position, img)
                
                quill.insertText(position + 1, '\n');
                // 插入图片描述
                const caption = `<p>${fact.description}</p>`;
                quill.clipboard.dangerouslyPasteHTML(position + 2, caption);
            }
        }
    }

    const dataRows = data.rows
    const dataFields = data.columns


    // 计算Table的列宽
    const width_list = new Array(dataFields.length).fill(80);
    dataRows.forEach(row => {
        dataFields.forEach((field, index)=>{
            const str = row[field].toString()
            const col_width = str.length * 10
            width_list[index] = Math.max(col_width, width_list[index])
        })
    });

    const columns = dataFields.map((field, index)=>{
        return {
            title: field,
            dataIndex: field,
            key: field,
            width: width_list[index],
        }
    })
    const schema = data.schema

    return (
        <div>
            <div className="fact-config">
                <div className="fact-config-header">Data Fact Configuration</div>
                <div className="fact-config-panel">
                    <EditorView fact={fact} data={dataRows} schema={schema} factIndex={factIndex} star={star} nodeId={nodeId} setChartName={getChartName}/>
                </div>
            </div>
            <div className="data-source" onMouseLeave={()=>{setIsFixed(false)}} onMouseEnter={()=>{setIsFixed(true)}}>
                <div className="data-source-header">Data Source</div>
                <Table columns={columns} dataSource={dataRows} scroll={{x: '100%', y: 200}} pagination={{size: "small", simple: { readOnly: true }}}/>
            </div>
            <div className="panel-footer">
                <div className="data-source-name">{`Source: WDI/${tableName}`}</div>
                <Button onClick={insertChart}>Add to News</Button>
            </div>
        </div>
    )
}

const RetrievedFacts = (props)=>{
    const store = useStore(selector, shallow)
    const [items, setItems] = useState([])

    useEffect(()=>{
        const currentItems = store.currentNode?.data?.facts?.map((fact, index)=>{
            return  {
                key: index,
                label: panelHeader(fact.relevance, fact.stance.label),
                children: <PanelContent fact={fact.fact} table={fact.table} factIndex={index} star={fact.star} nodeId={store.currentNode.id} editorRef={store.editorRef} setIsFixed={props.setIsFixed}/>,
                style: itemDefaultStyle
            }
        })
        setItems(currentItems)
    },[store.currentNode])

    return (
        // <div className="retrieved-facts">
        //     {/* <div className="retrieved-facts-header">
        //         <EditFilled style={{color: 'rgba(133, 140, 144, 1)'}}/>
        //         <div style={{marginLeft: '10px'}}>Retrvieved Data Facts</div>
        //     </div> */}
        //     <div className="retrieved-facts-content">
        //         <Collapse
        //             className="fact-collapse" 
        //             items={items} 
        //             bordered={false}
        //             defaultActiveKey={['0']} 
        //             expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        //         />
        //     </div>
        // <div className="retrieved-facts">
        //     <Collapse
        //         className="fact-collapse" 
        //         items={items} 
        //         bordered={false}
        //         defaultActiveKey={['0']} 
        //         expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        //     />
        // </div>

    <div className="fact-collapse"> 
        {items?.length ? 
        <Spin tip="Retrieving" spinning={props.isRetrieving}>
        <Collapse
            items={items} 
            bordered={false}
            defaultActiveKey={['0']} 
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        /> 
        </Spin>
        : 
        <div className="blank-view">
            <Spin tip="Retrieving" spinning={props.isRetrieving}>
                <div className="blank-spinner">
                    <img className="blank-placeholder" src={props.isRetrieved ? blank2 : blank1} />
                    <div className="blank-tip">{props.isRetrieved ? 'Unable to retrieve relevant data facts' : 'Please retrieve the relevant data facts'}</div>
                </div>
            </Spin>
        </div>
        }
    </div>
    )
}

export default RetrievedFacts