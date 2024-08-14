import React, { Component, useEffect } from 'react';
import { Row, Col, Select, Button, Modal, Radio } from 'antd';
import { getAggregatedRows, datafilter } from './helper';
import AggregationType from '../../../../../constant/AggregationType';
import { fact2visRules } from '../../../../../tools/fact2visRule';

const { Option } = Select;

// export default class Outlier extends Component {

//     render() {
//         let { handleChartChange, getFieldValue, isDisabled, handleMeasureChange, handleAGGChange, handleFilterChange, onRadioChange, removeFilter, handleSubOk, handleSubCancel, handleBreakdownChange, showModal, updateFact } = this.props;
//         let fact = this.props.fact;
//         let schema = this.props.schema;
//         let measureList = schema.filter(key => key['type'] === "numerical")
//         measureList.push({ field: "COUNT", type: "numerical" })
//         const aggregationType = [],
//             subspaceList = schema.filter(key => key['type'] !== "numerical"),//只能categorical, temporal
//             breakdownList = schema.filter(key => key['type'] !== "numerical"),//只能categorical, temporal
//             subValueList = getFieldValue(this.props.data, this.props.filterField),
//             supportedChartTypes = fact2visRules.filter(x => x.fact === fact.type)
//             // breakdownValueList = getFieldValue(this.props.data, fact.breakdown)

//         // aggregation
//         if (fact.measure.length && fact.breakdown.length) {
//             let encoding = {}
//             encoding['y'] = {};
//             encoding['y']['field'] = fact.measure[0].field;
//             encoding['y']['aggregation'] = fact.measure[0].aggregate;
//             encoding['x'] = {};
//             encoding['x']['field'] = fact.breakdown[0];
//             let filteredData = datafilter(this.props.data, fact.subspace)
//             let aggregatedRows = getAggregatedRows(filteredData, encoding);
//             // filter breakdownValueList
//             // let measureField = fact.measure[0]['field'];
//             let newOrder = aggregatedRows.sort(function (a, b) { return b[encoding.y.field] - a[encoding.y.field]; }).map(function (d) { return d[encoding.x.field]; })
//             let newOrderValue = aggregatedRows.sort(function (a, b) { return b[encoding.y.field] - a[encoding.y.field]; }).map(function (d) { return d[encoding.y.field]; })

//             let n = newOrderValue.length
//             // 整数部分
//             let posQ3 = parseInt((n - 1) * 0.25)
//             let posQ1 = parseInt((n - 1) * 0.75)
//             // 小数部分
//             let decimalQ3 = (n - 1) * 0.25 - posQ3
//             let decimalQ1 = (n - 1) * 0.75 - posQ1
//             let Q3 = newOrderValue[posQ3] + (newOrderValue[posQ3 + 1] - newOrderValue[posQ3]) * decimalQ3
//             let Q1 = newOrderValue[posQ1] + (newOrderValue[posQ1 + 1] - newOrderValue[posQ1]) * decimalQ1

//             let Low = Q1 - 1.5 * (Q3 - Q1)
//             let Up = Q3 + 1.5 * (Q3 - Q1)
//             let outlierIndex = []
//             newOrderValue.forEach((d, i) => {
//                 if (d > Up || d < Low) {
//                     outlierIndex.push(i)
//                 }
//             });

//             /***** 设默认为outlier，并且更新到fact中 *****/
//             let newFact = this.props.fact
//             if (!newFact.focus.length && outlierIndex.length) {
//                 if (outlierIndex.length) {
//                     newFact.focus = [{
//                         field: fact.breakdown[0],
//                         value: newOrder[outlierIndex[0]],
//                     }]
//                 }
//                 updateFact(newFact, this.props.factIndex)
//             } else if (outlierIndex.length === 0) {
//                 // newFact.focus = Object.assign([], [])
//                 // updateScoreScript(newFact)
//             }
//         }
//         let modalPosition;
//         if (document.getElementById('add-subspace-outlier')) {
//             modalPosition = document.getElementById('add-subspace-outlier').getBoundingClientRect()
//         }

//         for (let key in AggregationType) {
//             if (key !== 'COUNT')
//                 aggregationType.push(AggregationType[key])
//         }
//         let measure = []
//         if (!fact.measure.length) {
//             measure = [{}]
//         } else {
//             measure = fact.measure
//         }

//         return (
//             <div className="config-panel">
//                 <Row key={'chart'} className="shelf">
//                     <Col span={8} className="channelName">chart</Col>
//                     <Col span={16}>
//                         <Select className="select-box" id="select-chart" defaultValue={fact.chart} value={fact.chart} size='small' onChange={handleChartChange}>
//                             {supportedChartTypes.map((key) => <Option key={key.chart} value={key.chart}>{key.chart}</Option>)}
//                         </Select>
//                     </Col>
//                 </Row>

//                 {measure.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={'measure' + i}>
//                     <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? "measure" : ''}</Col>
//                     <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
//                         <Row style={{marginBottom: '0', border: '0'}}>
//                         <Col span={14}>
//                             <Select className="select-box" id={"select-measure" + i} defaultValue={key.field} value={key.field} size='small' onChange={(value) => handleMeasureChange(value, i)}>
//                                 {measureList.map((key) =>
//                                     <Option key={key.field} value={key.field} disabled={isDisabled(fact.measure, 'field', key.field)}>{key.field}</Option>
//                                 )}
//                             </Select>
//                         </Col>
//                         <Col span={10}>
//                             <Select className="select-box" id={"select-agg" + i}
//                                 disabled={key.field === "COUNT" ? true : false}
//                                 defaultValue={key.aggregate}
//                                 value={key.aggregate === "count" ? '' : key.aggregate}
//                                 size='small'
//                                 onChange={(value) => handleAGGChange(value, i)}
//                             >
//                                 {aggregationType.map((key) => <Option key={key} value={key}>{key}</Option>)}
//                             </Select>
//                         </Col>
//                         </Row>
//                     </Col>
//                 </Row>)}

//                 {fact.subspace.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={key.field}>
//                     <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? "subspace" : ''}</Col>
//                     <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
//                         {/* <Col span={2}></Col> */}
//                         <Row style={{marginBottom: '0', border: '0'}}>
//                         <Col span={20} title={`${key.field} = ${key.value}`} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: '7px', display: 'flex', alignItems: 'center' }}>{`${key.field} = ${key.value}`}</Col>
//                         <Col span={4} className="channelSlot">
//                             <Button shape="circle" type="link" size="small" style={{ fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFilter(key)} />
//                         </Col>
//                         </Row>
//                     </Col>
//                 </Row>)}

//                 <Row className={fact.subspace.length === 0 ? 'shelf' : ''}>
//                     <Col span={8} className={fact.subspace.length === 0 ? 'channelName' : ''}>{fact.subspace.length === 0 ? "subspace" : ''}</Col>
//                     <Col span={16} >
//                         <Button id='add-subspace-outlier' size='small' onClick={showModal}>
//                             +
//                         </Button>
//                     </Col>
//                 </Row>

//                 <Modal
//                     closable={false}
//                     mask={false}
//                     open={this.props.subVisible}
//                     onOk={handleSubOk}
//                     onCancel={handleSubCancel}
//                     style={{
//                         position: "absolute",
//                         // left: modalPosition ? modalPosition.left + modalPosition.width : 285, 
//                         right: 0,
//                         top: modalPosition ? modalPosition.top : 450
//                     }}
//                     width={290}
//                 >
//                     <Row className="shelf">
//                         <Col span={8} className="channelName">field</Col>
//                         <Col span={16}>
//                             <Select className="select-box" id="select-field" defaultValue='please select' value={this.props.subSelectValue} size='small' onChange={handleFilterChange}>
//                                 {subspaceList.map((key) => <Option key={key.field} value={key.field} disabled={isDisabled(fact.subspace, 'field', key.field)}>{key.field}</Option>)}
//                             </Select>
//                         </Col>
//                     </Row>
//                     <Row style={{ display: this.props.filterField ? 'block' : 'none' }}>
//                         <Col span={8} className="channelName">value</Col>
//                         <Col span={1}></Col>
//                         <Col span={15} style={{ maxHeight: 165, overflow: 'scroll' }}>
//                             <Radio.Group name="radiogroup" onChange={onRadioChange}>
//                                 {subValueList.map((key) => <Radio key={key} style={{ display: 'block' }} value={key}>{key}</Radio>)}
//                             </Radio.Group>
//                         </Col>
//                     </Row>
//                 </Modal>

//                 <Row key={'breakdown'} className="shelf">
//                     <Col span={8} className="channelName">breakdown</Col>
//                     <Col span={16}>
//                         <Select className="select-box" id="select-breakdown" defaultValue={fact.breakdown[0]} value={fact.breakdown[0]} size='small' onChange={handleBreakdownChange}>
//                             {breakdownList.map((key) => <Option key={key.field} value={key.field}>{key.field}</Option>)}
//                         </Select>
//                     </Col>
//                 </Row>

//                 {fact.focus.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={i} >
//                     <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? "focus" : ''}</Col>
//                     <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
//                         {/* <Col span={2}></Col> */}
//                         <Row style={{marginBottom: '0', border: '0'}}>
//                         <Col span={20} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: '7px', display: 'flex', alignItems: 'center' }}>{key.value}</Col>
//                         <Col span={4} className="channelSlot" style={{ height: 24 }}>
//                             {/* <Button shape="circle" type="link" size="small" style={{ visible: 'hidden',fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFocus(key)} /> */}
//                         </Col>
//                         </Row>
//                     </Col>
//                 </Row>)}
                
//                 {/* 这是干嘛的 */}
//                 {/* <Row className={fact.focus.length === 0 ? 'shelf' : ''}>
//                     <Col span={8} className={fact.focus.length === 0 ? 'channelName' : ''}>{fact.focus.length === 0 ? "focus" : ''}</Col>
//                     <Col span={16} style={{ display: fact.focus.length === 0 ? 'block' : 'none', border: fact.focus.length === 0 ? 'none' : '1px solid black' }}>
//                         <Button id='add-focus' size='small'>No outlier</Button>
//                     </Col>
//                 </Row> */}

//                 {/* {fact.focus.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={key.value} style={{ display: 'block' }}>
//                     <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? 'focus' : ''}</Col>
//                     <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
//                         <Col span={2}></Col>
//                         <Col span={18} title={`${key.field} = ${key.value}`} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{`${key.field} = ${key.value}`}</Col>
//                         <Col span={4} className="channelSlot">
//                             <Button shape="circle" type="link" size="small" style={{ fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFocus(key)} />
//                         </Col>
//                     </Col>
//                 </Row>)}

//                 {displayFocus} */}

//             </div>
//         )
//     }
// }

const Outlier = (props)=>{

        let { handleChartChange, getFieldValue, isDisabled, handleMeasureChange, handleAGGChange, handleFilterChange, onRadioChange, removeFilter, handleSubOk, handleSubCancel, handleBreakdownChange, showModal, updateFact } = props;
        let fact = props.fact;
        let schema = props.schema;
        let measureList = schema.filter(key => key['type'] === "numerical")
        measureList.push({ field: "COUNT", type: "numerical" })
        const aggregationType = [],
            subspaceList = schema.filter(key => key['type'] !== "numerical"),//只能categorical, temporal
            breakdownList = schema.filter(key => key['type'] !== "numerical"),//只能categorical, temporal
            subValueList = getFieldValue(props.data, props.filterField),
            supportedChartTypes = fact2visRules.filter(x => x.fact === fact.type.toLowerCase())
            // breakdownValueList = getFieldValue(this.props.data, fact.breakdown)

        useEffect(()=>{
        // aggregation
        if (fact.measure.length && fact.breakdown.length) {
            let encoding = {}
            encoding['y'] = {};
            encoding['y']['field'] = fact.measure[0].field;
            encoding['y']['aggregation'] = fact.measure[0].aggregate;
            encoding['x'] = {};
            encoding['x']['field'] = fact.breakdown[0];
            let filteredData = datafilter(props.data, fact.subspace)
            let aggregatedRows = getAggregatedRows(filteredData, encoding);
            // filter breakdownValueList
            // let measureField = fact.measure[0]['field'];
            let newOrder = aggregatedRows.sort(function (a, b) { return b[encoding.y.field] - a[encoding.y.field]; }).map(function (d) { return d[encoding.x.field]; })
            let newOrderValue = aggregatedRows.sort(function (a, b) { return b[encoding.y.field] - a[encoding.y.field]; }).map(function (d) { return d[encoding.y.field]; })

            let n = newOrderValue.length
            // 整数部分
            let posQ3 = parseInt((n - 1) * 0.25)
            let posQ1 = parseInt((n - 1) * 0.75)
            // 小数部分
            let decimalQ3 = (n - 1) * 0.25 - posQ3
            let decimalQ1 = (n - 1) * 0.75 - posQ1
            let Q3 = newOrderValue[posQ3] + (newOrderValue[posQ3 + 1] - newOrderValue[posQ3]) * decimalQ3
            let Q1 = newOrderValue[posQ1] + (newOrderValue[posQ1 + 1] - newOrderValue[posQ1]) * decimalQ1

            let Low = Q1 - 1.5 * (Q3 - Q1)
            let Up = Q3 + 1.5 * (Q3 - Q1)
            let outlierIndex = []
            newOrderValue.forEach((d, i) => {
                if (d > Up || d < Low) {
                    outlierIndex.push(i)
                }
            });

            /***** 设默认为outlier，并且更新到fact中 *****/
            let newFact = {...fact}
            if (!newFact.focus.length && outlierIndex.length) {
                if (outlierIndex.length) {
                    newFact.focus = [{
                        field: fact.breakdown[0],
                        value: newOrder[outlierIndex[0]],
                        isOutlier: true
                    }]
                }
                updateFact(newFact, props.factIndex)
            } else if (outlierIndex.length === 0 && fact.focus.length>0 && fact.focus[0].isOutlier) {
                // 当focus包含上一次计算得到的outlier，而这次计算没有outlier时,需要更新
                newFact.focus = Object.assign([], [])
                console.log('nee up', newFact)
                updateFact(newFact, props.factIndex)
            }


        }
    }, [fact])

        let modalPosition;
        if (document.getElementById('add-subspace-outlier')) {
            modalPosition = document.getElementById('add-subspace-outlier').getBoundingClientRect()
        }

        for (let key in AggregationType) {
            if (key !== 'COUNT')
                aggregationType.push(AggregationType[key])
        }
        let measure = []
        if (!fact.measure.length) {
            measure = [{}]
        } else {
            measure = fact.measure
        }

        return (
            <div className="config-panel">
                <Row key={'chart'} className="shelf">
                    <Col span={8} className="channelName">Chart</Col>
                    <Col span={16}>
                        <Select className="select-box" id="select-chart" defaultValue={fact.chart} value={fact.chart} size='small' onChange={handleChartChange}>
                            {supportedChartTypes.map((key) => <Option key={key.chart} value={key.chart}>{key.chart}</Option>)}
                        </Select>
                    </Col>
                </Row>

                {measure.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={'measure' + i}>
                    <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? "Measure" : ''}</Col>
                    <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
                        <Row style={{marginBottom: '0', border: '0'}}>
                        <Col span={14}>
                            <Select className="select-box" id={"select-measure" + i} defaultValue={key.field} value={key.field} size='small' onChange={(value) => handleMeasureChange(value, i)}>
                                {measureList.map((key) =>
                                    <Option key={key.field} value={key.field} disabled={isDisabled(fact.measure, 'field', key.field)}>{key.field}</Option>
                                )}
                            </Select>
                        </Col>
                        <Col span={10}>
                            <Select className="select-box" id={"select-agg" + i}
                                disabled={key.field === "COUNT" ? true : false}
                                defaultValue={key.aggregate}
                                value={key.aggregate === "count" ? '' : key.aggregate}
                                size='small'
                                onChange={(value) => handleAGGChange(value, i)}
                            >
                                {aggregationType.map((key) => <Option key={key} value={key}>{key}</Option>)}
                            </Select>
                        </Col>
                        </Row>
                    </Col>
                </Row>)}

                {fact.subspace.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={key.field}>
                    <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? "Subspace" : ''}</Col>
                    <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
                        {/* <Col span={2}></Col> */}
                        <Row style={{marginBottom: '0', border: '0'}}>
                        <Col span={20} title={`${key.field} = ${key.value}`} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: '7px', display: 'flex', alignItems: 'center' }}>{`${key.field} = ${key.value}`}</Col>
                        <Col span={4} className="channelSlot">
                            <Button shape="circle" type="link" size="small" style={{ fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFilter(key)} />
                        </Col>
                        </Row>
                    </Col>
                </Row>)}

                <Row className={fact.subspace.length === 0 ? 'shelf' : ''}>
                    <Col span={8} className={fact.subspace.length === 0 ? 'channelName' : ''}>{fact.subspace.length === 0 ? "Subspace" : ''}</Col>
                    <Col span={16} >
                        <Button id='add-subspace-outlier' size='small' onClick={showModal}>
                            +
                        </Button>
                    </Col>
                </Row>

                <Modal
                    closable={false}
                    mask={false}
                    open={props.subVisible}
                    onOk={handleSubOk}
                    onCancel={handleSubCancel}
                    style={{
                        position: "absolute",
                        // left: modalPosition ? modalPosition.left + modalPosition.width : 285, 
                        right: 0,
                        top: modalPosition ? modalPosition.top : 450
                    }}
                    width={290}
                >
                    <Row className="shelf">
                        <Col span={8} className="channelName">field</Col>
                        <Col span={16}>
                            <Select className="select-box" id="select-field" defaultValue='please select' value={props.subSelectValue} size='small' onChange={handleFilterChange}>
                                {subspaceList.map((key) => <Option key={key.field} value={key.field} disabled={isDisabled(fact.subspace, 'field', key.field)}>{key.field}</Option>)}
                            </Select>
                        </Col>
                    </Row>
                    <Row style={{ display: props.filterField ? 'block' : 'none' }}>
                        <Col span={8} className="channelName">value</Col>
                        <Col span={1}></Col>
                        <Col span={15} style={{ maxHeight: 165, overflow: 'scroll' }}>
                            <Radio.Group name="radiogroup" onChange={onRadioChange}>
                                {subValueList.map((key) => <Radio key={key} style={{ display: 'block' }} value={key}>{key}</Radio>)}
                            </Radio.Group>
                        </Col>
                    </Row>
                </Modal>

                <Row key={'breakdown'} className="shelf">
                    <Col span={8} className="channelName">Breakdown</Col>
                    <Col span={16}>
                        <Select className="select-box" id="select-breakdown" defaultValue={fact.breakdown[0]} value={fact.breakdown[0]} size='small' onChange={handleBreakdownChange}>
                            {breakdownList.map((key) => <Option key={key.field} value={key.field}>{key.field}</Option>)}
                        </Select>
                    </Col>
                </Row>

                {fact.focus.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={i} >
                    <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? "Focus" : ''}</Col>
                    <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
                        {/* <Col span={2}></Col> */}
                        <Row style={{marginBottom: '0', border: '0'}}>
                        <Col span={20} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: '7px', display: 'flex', alignItems: 'center' }}>{key.value}</Col>
                        <Col span={4} className="channelSlot" style={{ height: 24 }}>
                            {/* <Button shape="circle" type="link" size="small" style={{ visible: 'hidden',fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFocus(key)} /> */}
                        </Col>
                        </Row>
                    </Col>
                </Row>)}
                
                <Row>
                    <Col span={8}>Focus</Col>
                    <Col span={16}>
                        <Row style={{marginBottom: '0', border: '0'}}>
                        <Col span={20} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: '7px', display: 'flex', alignItems: 'center' }}>No Outlier</Col>
                        <Col span={4} className="channelSlot" style={{ height: 24 }}>
                            {/* <Button shape="circle" type="link" size="small" style={{ visible: 'hidden',fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFocus(key)} /> */}
                        </Col>
                        </Row>
                    </Col>
                </Row>

                
                {/* 这是干嘛的 */}
                {/* <Row className={fact.focus.length === 0 ? 'shelf' : ''}>
                    <Col span={8} className={fact.focus.length === 0 ? 'channelName' : ''}>{fact.focus.length === 0 ? "focus" : ''}</Col>
                    <Col span={16} style={{ display: fact.focus.length === 0 ? 'block' : 'none', border: fact.focus.length === 0 ? 'none' : '1px solid black' }}>
                        <Button id='add-focus' size='small'>No outlier</Button>
                    </Col>
                </Row> */}

                {/* {fact.focus.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={key.value} style={{ display: 'block' }}>
                    <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? 'focus' : ''}</Col>
                    <Col span={16} style={{ border: i === 0 ? 'none' : '1px solid black' }}>
                        <Col span={2}></Col>
                        <Col span={18} title={`${key.field} = ${key.value}`} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{`${key.field} = ${key.value}`}</Col>
                        <Col span={4} className="channelSlot">
                            <Button shape="circle" type="link" size="small" style={{ fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFocus(key)} />
                        </Col>
                    </Col>
                </Row>)}

                {displayFocus} */}

            </div>
        )
}

export default Outlier
