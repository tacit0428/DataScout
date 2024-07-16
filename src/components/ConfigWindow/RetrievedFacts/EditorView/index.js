import React, { Component } from 'react';
import { Row, Col, Select, Button } from 'antd';
import './index.css';

export default class EditorView extends Component {



    render() {
        return (
            <div className="config-panel">
                    <div className='chart-preview'>test</div>
                    <div id="select-panel" style={{ width: "100%", overflow: "auto", }}>
                        <Row className="shelf">
                            <Col span={8} className="channelName">type</Col>
                            <Col span={16}>
                                <Select className="select-box" id="select-type" defaultValue='' value='' size='small'>
                                </Select>
                            </Col>
                        </Row>
                        <Row className="shelf">
                            <Col span={8} className="channelName">chart</Col>
                            <Col span={16}>
                                <Select className="select-box" id="select-type" defaultValue='' value='' size='small'>
                                </Select>
                            </Col>
                        </Row>
                        <Row className='shelf'>
                            <Col span={8} className='channelName'>measure</Col>
                                <Col span={10}>
                                    <Select className="select-box" id="select-measure" defaultValue='' value='' size='small'>
                                    </Select>
                                </Col>
                                <Col span={6}>
                                    <Select className="select-box" id="select-agg" defaultValue='' value='' size='small'>
                                    </Select>
                                </Col>
                        </Row>
                        <Row className={'shelf'}>
                            <Col span={8} className='channelName'>subspace</Col>
                            <Col span={16}>
                                <Button id='add-subspace' size='small'>
                                    +
                                </Button>
                            </Col>
                        </Row>
                        <Row className="shelf">
                            <Col span={8} className="channelName">breakdown</Col>
                            <Col span={16}>
                                <Select className="select-box" id="select-type" defaultValue='' value='' size='small'>
                                </Select>
                            </Col>
                        </Row>
                        <Row className={'shelf'}>
                            <Col span={8} className='channelName'>focus</Col>
                            <Col span={16}>
                                <Button id='add-subspace' size='small'>
                                    +
                            </Button>
                            </Col>
                        </Row>
                    </div>
            </div>
        )
            
    }
}
