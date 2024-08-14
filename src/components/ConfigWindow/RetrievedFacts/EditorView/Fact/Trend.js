import React, { Component } from 'react';
import { Row, Col, Select, Button, Modal, Radio } from 'antd';
import AggregationType from '../../../../../constant/AggregationType';
import { fact2visRules } from '../../../../../tools/fact2visRule';

const { Option } = Select;

export default class Trend extends Component {
    componentWillUpdate() {
        let fact = this.props.fact;
        let factIndex = this.props.factIndex;
        let schema = this.props.schema;
        let breakdownList = schema.filter(key => key['type'] === "temporal")
        const breakdownFieldList = breakdownList.map((d) => d.field)
        if (fact.breakdown.length && breakdownList.length && breakdownFieldList.indexOf(fact.breakdown[0]) === -1) {
            let newFact = Object.assign(this.props.fact)
            newFact.breakdown[0] = breakdownList[0].field
            this.props.updateFact(newFact, factIndex)
        }
    }

    render() {
        let { handleChartChange, getFieldValue, isDisabled, handleMeasureChange, handleAGGChange, handleFilterChange, onRadioChange, removeFilter, handleSubOk, handleSubCancel, handleBreakdownChange, showModal, handleFocusChange, onFocusClick, removeFocus, onFocusBlur } = this.props;
        let fact = this.props.fact;
        let schema = this.props.schema;
        let measureList = schema.filter(key => key['type'] === "numerical")
        // COUNT为什么是field
        measureList.push({ field: "COUNT", type: "numerical" })
        const aggregationType = [],
            subspaceList = schema.filter(key => key['type'] !== "numerical"),//只能categorical, temporal
            breakdownList = schema.filter(key => key['type'] === "temporal"),//只能temporal
            subValueList = getFieldValue(this.props.data, this.props.filterField),
            supportedChartTypes = fact2visRules.filter(x => x.fact === fact.type.toLowerCase()),
            breakDownValueList = getFieldValue(this.props.data, fact.breakdown)
        // const breakdownFieldList = breakdownList.map((d) => d.field)

        let modalPosition;
        if (document.getElementById('add-subspace')) {
            modalPosition = document.getElementById('add-subspace').getBoundingClientRect()
        }

        for (let key in AggregationType) {
            if (key !== 'COUNT')
                aggregationType.push(AggregationType[key])
        }

        let measure = []
        if (!fact.measure.length) {
            measure = [{}]
        } else {
            measure = fact.measure.slice(0,1) // measure只需要一个
        }

        let focus = []
        if (fact.focus && fact.focus.length) {
            for (const item of fact.focus) {
                if (item.field == fact.breakdown[0]) {
                    focus.push(item)
                }
            }
        }
        fact.foucs = focus

        const focusButton = <Row className={fact.focus.length === 0 ? 'shelf' : ''}>
            <Col span={8} className={fact.focus.length === 0 ? 'channelName' : ''}>{fact.focus.length === 0 ? "Focus" : ''}</Col>
            <Col span={16} style={{ border: fact.focus.length === 0 ? 'none' : '1px solid black' }}>
                <Button onClick={onFocusClick} id='add-focus' size='small'>+</Button>
            </Col>
        </Row>

        const focusSelector = <Row className={fact.focus.length === 0 ? 'shelf' : ''}>
            <Col span={8} className={fact.focus.length === 0 ? 'channelName' : ''}>{fact.focus.length === 0 ? "Focus" : ''}</Col>
            <Col span={16} style={{ border: fact.focus.length === 0 ? 'none' : '1px solid black' }}>
                <Select defaultOpen className="select-box" defaultValue={'please select'} size='small' onChange={handleFocusChange}>
                    {breakDownValueList.map((key) => <Option disabled={isDisabled(fact.focus, 'value', key)} key={key} value={key}>{key}</Option>)}
                </Select>
            </Col>
        </Row>

        let displayFocus
        if (!fact.focus.length) {
            displayFocus = this.props.showFocusButton ? focusButton : focusSelector
        } else {
            displayFocus = <div></div>
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
                    <Col span={16}>
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
                    <Col span={16}>
                        <Row style={{marginBottom: '0', border: '0'}}>
                        {/* <Col span={1}></Col> */}
                        <Col span={20} title={`${key.field} = ${key.value}`} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: '7px', display: 'flex', alignItems: 'center'}}>{`${key.field} = ${key.value}`}</Col>
                        <Col span={4} className="channelSlot">
                            <Button type="link" size="small" style={{ fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFilter(key)} />
                        </Col>
                        </Row>
                    </Col>
                </Row>)}

                <Row className={fact.subspace.length === 0 ? 'shelf' : ''}>
                    <Col span={8} className={fact.subspace.length === 0 ? 'channelName' : ''}>{fact.subspace.length === 0 ? "Subspace" : ''}</Col>
                    <Col span={16}>
                        <Button id='add-subspace' size='small' onClick={showModal}>
                            +
                        </Button>
                    </Col>
                </Row>

                <Modal
                    closable={false}
                    mask={false}
                    open={this.props.subVisible}
                    onOk={handleSubOk}
                    onCancel={handleSubCancel}
                    style={{
                        position: "absolute",
                        //left: modalPosition ? modalPosition.left + modalPosition.width : 285, 
                        right: 0,
                        top: modalPosition ? modalPosition.top : 450
                    }}
                    width={290}
                >
                    <Row className="shelf">
                        <Col span={8} className="channelName">field</Col>
                        <Col span={16}>
                            <Select className="select-box" id="select-field" defaultValue='please select' value={this.props.subSelectValue} size='small' onChange={handleFilterChange}>
                                {subspaceList.map((key) => <Option key={key.field} value={key.field} disabled={isDisabled(fact.subspace, 'field', key.field)}>{key.field}</Option>)}
                            </Select>
                        </Col>
                    </Row>
                    <Row>
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
                        <Select className="select-box" id="select-breakdown" defaultValue={fact.breakdown[0]} value={fact.breakdown[0]} size='small' onChange={handleBreakdownChange} onBlur={onFocusBlur}>
                            {breakdownList.map((key) => <Option key={key.field} value={key.field}>{key.field}</Option>)}
                        </Select>
                    </Col>
                </Row>

                {fact.focus.map((key, i) => <Row className={i === 0 ? 'shelf' : ''} key={key.value} >
                    <Col span={8} className={i === 0 ? 'channelName' : ''}>{i === 0 ? "Focus" : ''}</Col>
                    <Col span={16} >
                        <Row style={{marginBottom: '0', border: '0'}}>
                        {/* <Col span={2}></Col> */}
                        <Col span={20} title={`${key.field} = ${key.value}`} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingLeft: '7px', display: 'flex', alignItems: 'center' }}>{`${key.field} = ${key.value}`}</Col>
                        <Col span={4} className="channelSlot">
                            <Button type="link" size="small" style={{ fontSize: '12px', position: 'relative', left: 2 }} icon="close" onClick={() => removeFocus(key)} />
                        </Col>
                        </Row>
                    </Col>
                </Row>)}
                {displayFocus}

            </div>
        )
    }
}
