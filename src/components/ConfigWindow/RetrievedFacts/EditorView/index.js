import React, { Component, useEffect, useState } from 'react';
import { useReactFlow, getOutgoers } from 'reactflow';
import { Row, Col, Select, Button } from 'antd';
import { v4 as uuidv4 } from 'uuid'
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { fact2visRules } from '../../../../tools/fact2visRule';
import FactType from '../../../../constant/FactType';
import { fact2chart, fact2vis, getFactChartType, datafilter } from '../../../../tools/fact2vis';
import { isValid } from '../../../../tools/helper';
import { BalloonLayout } from '../../../Mindmap/Layout/MDSLayout';
import { Association,Categorization, Difference, Distribution, Extreme, Outlier, Proportion, Rank, Trend, Value } from './Fact'
import './index.css';


import { useStore } from '../../../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  currentNode: store.currentNode,
  nodes: store.nodes,
  setNode: store.setNode,
})

const { Option } = Select;

const EditorView = (props)=> {
    // const store = useStore(selector, shallow)
    const store = useStore()
    const { fact, data, schema, factIndex, star, nodeId, setChartName } = props
    const [vis, setVis] = useState(null)
    // const [type, setType] = useState(fact?.type || 'value')
    const [filterField, setFilterField] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [subVisible, setSubVisible] = useState(false);
    const [showFocusButton, setShowFocusButton] = useState(true);
    const [subSelectValue, setSubSelectValue] = useState('please select');
    
    // const [showSubButton, setShowSubButton] = useState(true);
    // const supportedChartTypes = fact2visRules.filter(x => x.fact === fact.type)

    const state = {
        filterField,
        filterValue,
        subVisible,
        showFocusButton,
        subSelectValue,
    };

    const getFieldValue = (rawData, fieldName) => {
        if (fieldName)
            return Array.from(new Set(rawData.map(d => d[fieldName])));
        else return []
    }

    // 当breakdown可选值少于2时，无法比较，需要修改type
    const breakdownValueList = getFieldValue(data, fact.breakdown)
    if (breakdownValueList.length < 2 && fact.type.toLowerCase() == FactType.DIFFERENCE){
        fact.type = FactType.VALUE
    }

    // aggregate不能为空，不然isvalid(fact)会返回false
    if (fact.measure.length) {
        const aggregationList = ['avg', 'sum', 'max', 'min', 'none']
        fact.measure.forEach(item => {
            if (!aggregationList.includes(item.aggregate)) {
                item.aggregate = 'none'
            }
        });
    }

    const factTypeList = []
    for (let key in FactType) {
        factTypeList.push(FactType[key])
    }

    const handleTypeChange = (value) => {
        let newFact = {...fact}
        newFact.type = value
        if (value.toLowerCase() !== FactType.ASSOCIATION && newFact.measure.length === 2) {
            newFact.measure = [newFact.measure[0]]
        }
        newFact.chart = getFactChartType(newFact, data)
        newFact.focus = Object.assign([], [])
        // setType(value)
        updateFact(newFact, factIndex)
    }

    const handleChartChange = (value) => {
        let newFact = {...fact}
        newFact.chart = value
        updateFact(newFact, factIndex)
    }

    const handleMeasureChange = (value, i) => {
        let newFact = {...fact}
        let newList = Object.assign({}, newFact.measure[i]);
        // 为什么？
        if (value === "COUNT") {
            newList.aggregate = 'count';
        } else {
            newList.aggregate = 'sum';
        }
        newList.field = value
        newFact.measure[i] = newList
        updateFact(newFact, factIndex)
    }

    const handleAGGChange = (value, i) => {
        let newFact = {...fact}
        let newList = Object.assign({}, newFact.measure[i]);
        if (newList) {
            newList.aggregate = value
            newFact.measure[i] = newList
        }
        updateFact(newFact, factIndex)
    }

    const handleFilterChange = (value) => {
        // let newList = getFieldValue(data, value)
        // this.setState({
        //     checkAll: true,
        //     filterField: value,
        //     subValueList: newList,
        //     subSelectValue: value
        // })
        // checkALl subValueList未知
        setFilterField(value)
        setSubSelectValue(value)
    }

    const onRadioChange = e => {
        setFilterValue(e.target.value)
    }

    // 删除subspace中的一项
    const removeFilter = (value) => {
        let newFact = {...fact}
        let newList = newFact.subspace
        let index = newFact.subspace.indexOf(value)
        newList.splice(index, 1)
        newFact.subspace = newList
        updateFact(newFact, factIndex)
    }

    // subspace新加入一行
    const handleSubOk = (e) => {
        let newFilter = {
            field: filterField,
            value: filterValue
        }
        let newFact = {...fact}
        let newList = newFact.subspace
        newList.push(newFilter)
        newFact.subspace = newList;
        setSubVisible(false)
        setFilterField('')
        setSubSelectValue('please select')
        updateFact(newFact, factIndex)
    };

    const handleSubCancel = (e) => {
        setSubVisible(false)
    };

    const handleBreakdownChange = (value) => {
        let newFact = {...fact}
        newFact.breakdown = [value]
        newFact.focus = Object.assign([], [])
        updateFact(newFact, factIndex)
    }

    const onFocusClick = () => {
        setShowFocusButton(false)
    }

    const handleFocusChange = (value, focusIndex = 0) => {
        let newFact = {...fact}
        let newList = newFact.focus
        let newFocus = {
            field: newFact.breakdown[0],
            value: value
        }
        if (newFact.type.toLowerCase() === FactType.EXTREME) {
            newFact.focus[0].value = value.split(':')[1]
            newFact.focus[0].extremeFocus = value.split(':')[0]
            newFact.focus[0].extremeValue = value.split(':')[2]
        } else if (newFact.type.toLowerCase() === FactType.PROPORTION) {
            if (!newFact.focus.length) {
                newFact.focus = [{ field: newFact.breakdown[0] }]
            }
            newFact.focus[0].value = value
        } else if (newFact.type.toLowerCase() === FactType.DIFFERENCE) {
            if (focusIndex === 1) {
                newFact.focus[1].value = value
            } else {
                newFact.focus[0].value = value
            }
        } else if (newFact.type.toLowerCase() === FactType.VALUE) {
            if (!newFact.focus.length) {
                newFact.focus = [{ field: newFact.breakdown[0] }]
            }
            newFact.focus[0].value = value
        } else {
            newList.push(newFocus)
            // newFact.focus = newList
        }
        newFact.focus = newList
        console.log('focus', newFact.focus, newList)
        setShowFocusButton(true)
        updateFact(newFact, factIndex)
    }

    const removeFocus = (value) => {
        let newFact = {...fact}
        let newList = newFact.focus
        let index = newList.indexOf(value)
        newList.splice(index, 1)
        newFact.focus = newList
        setShowFocusButton(true)
        updateFact(newFact, factIndex)
    }

    const onFocusBlur = () => {
        setShowFocusButton(true)
    }

    const isDisabled = (objArr, key, item) => {
        if (objArr.length) {
            let newArr = objArr.map((e) => e[key])
            if (newArr.indexOf(item) === -1) return false
            else return true
        } else {
            return false
        }
        // let newArr = objArr.map((e) => e[key])
        // if (newArr.indexOf(item) === -1) return false
        // else return true
    }

    const showModal = () => {
        setSubVisible(true)
    }

    const updateFact = (newFact, factIndex) => {
        let factList = store.currentNode.data.facts
        let newFactList = factList.map((fact, index)=>{
            if (index == factIndex) {
                return {
                    ...fact,
                    fact: newFact
                }
            } else {
                return fact
            }
        })
        let newNodes = store.nodes.map((node)=>{
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
        return newFactList
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
    
    const starFact = (()=>{
        let factList = store.currentNode.data.facts
        let newFactList = factList.map((fact, index)=>{
            if (index == factIndex) {
                return {
                    ...fact,
                    star: !fact.star
                }
            } else {
                return fact
            }
        })
        const topIndex = newFactList.findIndex(fact => fact.star === true);

        
        const nodeVis = document.getElementById(`query-node-vis-${nodeId}`)
        // const vissvg = document.getElementsByClassName(chartName)[0]?.childNodes[0]

        const container = document.getElementById(`querynode-${nodeId}`);
        const oldH = container.offsetHeight

        console.log('before star', store.nodes)
        if (topIndex != -1) {
            // 节点需要展示当前chart
            const chartName = newFactList[topIndex].chartName
            const vissvg = document.getElementsByClassName(chartName)[0]?.childNodes[0]
            const clonesvg = vissvg.cloneNode(true)
            const originalWidth = clonesvg.width.baseVal.value;
            const originalHeight = clonesvg.height.baseVal.value;
        
            clonesvg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
            clonesvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            clonesvg.setAttribute('width','100%')
            // clonesvg.setAttribute('height', 'auto')
            
            if (nodeVis.childNodes.length == 0) {
                nodeVis.appendChild(clonesvg)
                const borderColor =  nodeVis.style.borderColor
                nodeVis.style.border = `1px solid ${borderColor}`
            } else {
                nodeVis.innerHTML = ''
                nodeVis.appendChild(clonesvg)
            }
        } else if (topIndex == -1 && nodeVis.childNodes.length > 0) {
            // 当没有star的fact时，需要清除
            nodeVis.innerHTML = ''
            nodeVis.style.border = 'none'
        }

        const newContainer = document.getElementById(`querynode-${nodeId}`);
        const newH = newContainer.offsetHeight
        const newPosAbsY = store.currentNode.positionAbsolute.y- (newH-oldH)/2*(store.currentNode.scale-1)
        let newNodes = store.nodes.map((node)=>{
            if (node.id == store.currentNode.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        facts: newFactList
                    },
                    positionAbsolute: {
                        ...node.positionAbsolute,
                        y: newPosAbsY
                    },
                    showVis: topIndex==-1? false : true
                }
            } else {
                return node
            }
        })
        store.setNode(newNodes)
        const parentNode = store.nodes.filter(item => item.id == store.currentNode.parentNode)[0]
        const stance = topIndex>=0 ? newFactList[topIndex].stance.label : newFactList[0].stance.label
        BalloonLayout(newNodes, store.edges, parentNode, stance, store.setNode, 0, false)
    })

    useEffect(()=>{
        if (isValid(fact)) {
            // const newvis = fact2vis(uuidv4(), fact, data, factIndex, 220, 220, setChartName, updateFact);
            const newvis = fact2chart(uuidv4(), fact, data, 220, 220, setChartName);
            setVis(newvis)
            console.log('vis', fact, newvis)
        } 
    }, [fact])

    // 当breakdown后每一项的个数为1时，aggregate无意义，所以需要设为none
    useEffect(()=>{
        const filteredData = datafilter(data, fact.subspace);
        const xField = filteredData.map(item => item[fact.breakdown[0]]);
        const uniqueXFiled = new Set(xField);
    
        if (uniqueXFiled.size === filteredData.length) {
            fact.measure.forEach(item => {
                item.aggregate = 'none'
            });
        } 
    },[])

    // const nodeVis = document.getElementById(`query-node-vis-${nodeId}`)
    // const vissvg = document.getElementsByClassName(chartName)[0]?.childNodes[0]
    // if (factIndex==0 && nodeVis && nodeVis.childNodes.length == 0 && vissvg){
    //     const clonesvg = vissvg.cloneNode(true)
    //     const targetWidth = nodeVis.getBoundingClientRect().width
    //     const originalWidth = clonesvg.width.baseVal.value;
    //     const originalHeight = clonesvg.height.baseVal.value;
      
    //     clonesvg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
    //     clonesvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
    //     // const scaleFactor = targetWidth / originalWidth
    //     // clonesvg.style.width = `${originalWidth * scaleFactor}px`;
    //     // clonesvg.style.height = `${originalHeight * scaleFactor}px`;
    //     // clonesvg.setAttribute('width',`${originalWidth * scaleFactor}px`)
    //     // clonesvg.setAttribute('height', `${originalWidth * scaleFactor}px`)
    //     clonesvg.setAttribute('width','100%')
    //     clonesvg.setAttribute('height', 'auto')

    //     nodeVis.appendChild(clonesvg)
    //     const borderColor =  nodeVis.style.borderColor
    //     nodeVis.style.border = `1px solid ${borderColor}`
    // }

    let factConfig;
    switch (fact.type.toLowerCase()) {
        case FactType.TREND:
            factConfig = <Trend updateFact={updateFact} getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} onFocusBlur={onFocusBlur} {...state} {...props} />
            break;
        case FactType.ASSOCIATION:
            factConfig = <Association getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} {...state} {...props} />
            break;
        case FactType.CATEGORIZATION:
            factConfig = <Categorization getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} {...state} onFocusBlur={onFocusBlur} {...props} />
            break;
        case FactType.DIFFERENCE:
            factConfig = <Difference updateFact={updateFact} getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} {...state} {...props} />
            break;
        case FactType.DISTRIBUTION:
            factConfig = <Distribution getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} onFocusBlur={onFocusBlur} {...state} {...props} />
            break;
        case FactType.EXTREME:
            factConfig = <Extreme updateFact={updateFact} getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} {...state} {...props} />
            break;
        case FactType.OUTLIER:
            factConfig = <Outlier updateFact={updateFact} getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} {...state} {...props} />
            break;
        case FactType.PROPORTION:
            factConfig = <Proportion updateFact={updateFact} getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange}  {...state} {...props} />
            break;
        case FactType.RANK:
            factConfig = <Rank updateFact={updateFact} getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} {...state} {...props} />
            break;
        case FactType.VALUE:
            factConfig = <Value getFieldValue={getFieldValue} isDisabled={isDisabled} handleMeasureChange={handleMeasureChange} handleAGGChange={handleAGGChange} handleFilterChange={handleFilterChange} onRadioChange={onRadioChange} removeFilter={removeFilter} handleSubOk={handleSubOk} handleSubCancel={handleSubCancel} handleBreakdownChange={handleBreakdownChange} onFocusClick={onFocusClick} handleFocusChange={handleFocusChange} showModal={showModal} removeFocus={removeFocus} handleChartChange={handleChartChange} {...state} {...props} />
            break;

        default: 
            break;
    }

    return (
        <div className="config-panel">
            <div className='chart-preview'>
                <Button className='star-btn' onClick={starFact} icon={star ? <StarFilled style={{color: 'rgba(254, 189, 67, 1)'}} /> : <StarOutlined />}/>
                {vis}
            </div>
            <div id="select-panel" style={{ width: "100%", overflow: "auto", }}>
                <Row className="shelf">
                    <Col span={8} className="channelName">Type</Col>
                    <Col span={16}>
                        <Select className="select-box" id="select-type" size='small' defaultValue={fact.type.toLowerCase()} value={fact.type.toLowerCase()} onChange={handleTypeChange}>
                            {factTypeList.map((key) => <Option key={key} value={key} disabled={breakdownValueList.length<2 && key==FactType.DIFFERENCE}>{key}</Option>)}
                        </Select>
                    </Col>
                </Row>
                {factConfig}
            </div>
        </div>
    )
}

export default EditorView
