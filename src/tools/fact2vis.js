import React from 'react';
import { Row, Col } from 'antd';
import FactType from '../constant/FactType';
import ChartType from '../constant/ChartType';
import AreaChart from '../charts/AreaChart';
import BarChart from '../charts/BarChart';
import RankedBarChart from '../charts/RankedBarChart';
import ISOType from '../charts/ISOType';
import NumberChart from '../charts/NumberChart';
import LineChart from '../charts/LineChart';
import ProportionChart from '../charts/ProportionChart';
import ScatterPlot from '../charts/ScatterPlot';
import BubbleChart from '../charts/BubbleChart';
import Map from '../charts/Map';
// import datafilter from './datafilter';
import { getMapType } from './../../src/charts/Map/helper'
import { fact2visRules } from './fact2visRule';
import _ from 'lodash';
import { useStore } from '../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  currentNode: store.currentNode,
  nodes: store.nodes,
  setNode: store.setNode,
})

const defaultSpec = {
    "encoding": {},
    "style": {}
}

export const facts2charts = (facts, data, chartDiversity = 0) => {
    for (let i = 0; i < facts.length; i++) {
        let supportedChartTypes = fact2visRules.filter(x => x.fact === facts[i].type);
        if ((facts[i].type === FactType.DISTRIBUTION || facts[i].type === FactType.OUTLIER) && !isSuitableForMap(facts[i], data)) {
            supportedChartTypes.splice(0, 1)
        }
        let choiceCount = parseInt((supportedChartTypes.length + 1) * chartDiversity);
        let choicedChartTypes = supportedChartTypes.slice(0, choiceCount + 1);
        facts[i].chart = choicedChartTypes[Math.floor(Math.random() * choicedChartTypes.length)].chart;
    }
    return facts
}

export const getFactChartType = (fact, data, choice = 0) => {
    let supportedChartTypes = fact2visRules.filter(x => x.fact === fact.type.toLowerCase());
    if (supportedChartTypes.length === 0) {
        return "";
    }
    // let aggregationCount = parseInt((doubleNodes.length+1) * aggregationLevel)
    if ((fact.type.toLowerCase() === FactType.DISTRIBUTION || fact.type.toLowerCase() === FactType.OUTLIER) && !isSuitableForMap(fact, data)) {
        supportedChartTypes.splice(0, 1)
    }
    return supportedChartTypes[choice].chart;
}

export const datafilter = (data, subspace) => {
    let filteredData = data;
    for (const sub of subspace) {
        filteredData = filteredData.filter((x)=>x[sub.field]===sub.value)
    }
    return filteredData
}

const isValid = (fact) => {
    let rules = fact2visRules.filter(x => (x.fact === fact.type.toLowerCase() && x.chart === fact.chart));
    if (rules.length > 0) {
        return true;
    } else {
        return false;
    }
}

const isSuitableForMap = (fact, data) => {
    if (fact.type.toLowerCase() !== FactType.DISTRIBUTION || fact.measure.length !== 1 || fact.breakdown.length !== 1) {
        return false
    }
    let spec = { encoding: {} };
    spec.encoding['color'] = {};
    spec.encoding['color']['field'] = fact.measure[0].field;
    spec.encoding['color']['aggregation'] = fact.measure[0].aggregate;
    spec.encoding['area'] = {};
    spec.encoding['area']['field'] = fact.breakdown[0];
    if (getMapType(data, spec.encoding) === null) {
        return false
    } else {
        return true
    }
}


export const fact2chart = function (uuid, fact, data, width, height, setChartName, compound = false) {
    let spec = _.cloneDeep(defaultSpec);
    const filteredData = datafilter(data, fact.subspace);

    if (fact.chart == null || fact.chart === "") {
        fact.chart = getFactChartType(fact, data);
    }
    if (!isValid(fact)) {
        return null;
    }

    let chart = fact.chart;

    // if (chart==ChartType.SCATTER_PLOT) {
    //     // measure需要2个

    // } else {
    //     const yField = fact.measure[0].field

    // }

    // if (compound) {
    //     chart = fact.compoundChart;
    // }
    let vis1, vis2;
    switch (chart) {
        case ChartType.AREA_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            if (fact.focus.length > 0) {
                spec.style = {
                    'focus': fact.focus[0] ? fact.focus[0].value : '',
                }
            }
            return <AreaChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>;
        case ChartType.BUBBLE_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure.length > 0 ? fact.measure[0]['field'] : 'COUNT';
            spec.encoding['y']['aggregation'] = fact.measure.length > 0 ? fact.measure[0]['aggregate'] : 'count';
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'style': 'matrix', // matrix line
            }
            return <BubbleChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.COLOR_FILLING_MAP:
            spec.encoding['color'] = {};
            spec.encoding['color']['field'] = fact.measure[0].field;
            spec.encoding['color']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['area'] = {};
            spec.encoding['area']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': fact.focus.length ? fact.focus[0].value : '',
            }
            return <Map uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.HALF_RING_CHART:
            spec.encoding['size'] = {};
            spec.encoding['size']['field'] = fact.measure[0].field;
            spec.encoding['size']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['color'] = {};
            spec.encoding['color']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': fact.focus[0].value,
                'style': 'half_donut', // bar pie donut half_donut
            }
            return <ProportionChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.HORIZONTAL_BAR_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'order': 'descending',
            }
            return <RankedBarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>;
        case ChartType.VERTICAL_DIFFERENCE_BAR_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            if (fact.focus.length > 1) {
                spec.style = {
                    'difference': [fact.focus[0].value, fact.focus[1].value],
                }
            }
            return <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.VERTICAL_DIFFERENCE_ARROW_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            if (fact.focus.length > 1) {
                spec.style = {
                    'difference': [fact.focus[0].value, fact.focus[1].value],
                }
            }
            return <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.ISOTYPE_BAR_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            if (fact.focus.length > 0) {
                spec.style = {
                    'focus': [],
                }
                for (const focus of fact.focus) {
                    spec.style['focus'].push(focus.value)
                }
            }
            return <ISOType uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.JUXTAPOSITION:
            vis1 = <div></div>
            vis2 = <div></div>
            if (isValid(fact)) {
                vis1 = fact2chart(uuid, fact, data, width, height);
            }
            if (isValid(fact.aggregatedFact)) {
                vis2 = fact2chart(uuid + 1, fact.aggregatedFact, data, width, height);
            }
            
            return <Row style={{ width: width, height: height - 10 }}>
                <Col span={12}>
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'left', height: height - 10 }}>
                        {vis1}
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'left', height: height - 10 }}>
                        {vis2}
                    </div>
                </Col>
            </Row>
        case ChartType.LINE_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': '',
            }
            let validFocus = false
            if (fact.focus.length) {
                for (let focus of fact.focus) {
                    let focusItem = filteredData.filter(d=>d[focus.field]==focus.value)
                    if (focusItem.length) {
                        spec.style = {
                            'focus': focus.value,
                        }
                        fact.focus = [focus]
                        validFocus = true
                        break
                    }
                }
            }
            if (!validFocus) {
                fact.focus = []
            }
            return <LineChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>;
        
        case ChartType.PIE_CHART:
            spec.encoding['size'] = {};
            spec.encoding['size']['field'] = fact.measure[0].field;
            spec.encoding['size']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['color'] = {};
            spec.encoding['color']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': fact.focus[0].value,
                'style': 'pie', // bar pie donut half_donut
            }
            return <ProportionChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.PROGRESS_BAR_CHART:
            spec.encoding['size'] = {};
            spec.encoding['size']['field'] = fact.measure[0].field;
            spec.encoding['size']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['color'] = {};
            spec.encoding['color']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': fact.focus[0].value,
                'style': 'bar', // bar pie donut half_donut
            }
            return <ProportionChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.PROPORTION_ISOTYPE_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            if (fact.focus.length > 0) {
                spec.style = {
                    'proportion': fact.focus[0].value,
                }
            }
            return <ISOType uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.RING_CHART:
            spec.encoding['size'] = {};
            spec.encoding['size']['field'] = fact.measure[0].field;
            spec.encoding['size']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['color'] = {};
            spec.encoding['color']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': fact.focus[0].value,
                'style': 'donut', // bar pie donut half_donut
            }
            return <ProportionChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.SCATTER_PLOT:
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.measure[0].field;
            spec.encoding['x']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[1].field;
            spec.encoding['y']['aggregation'] = fact.measure[1].aggregate;
            spec.style = {
            }
            return <ScatterPlot uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>;
        case ChartType.STACKED_LINE_CHART:
            //TODO: STACKED_LINE_CHART
            vis1 = fact2chart(uuid, fact, data, width, height);
            vis2 = fact2chart(uuid + 1, fact.aggregatedFact, data, width, height);
            return <Row style={{ width: width, height: height - 10 }}>
                <Col span={12}>
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'left', height: height - 10 }}>
                        {vis1}
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'left', height: height - 10 }}>
                        {vis2}
                    </div>
                </Col>
            </Row>
        case ChartType.STACKED_BAR_CHART:
            //TODO: STACKED_BAR_CHART
            vis1 = fact2chart(uuid, fact, data, width, height);
            vis2 = fact2chart(uuid + 1, fact.aggregatedFact, data, width, height);
            return <Row style={{ width: width, height: height - 10 }}>
                <Col span={12}>
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'left', height: height - 10 }}>
                        {vis1}
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'left', height: height - 10 }}>
                        {vis2}
                    </div>
                </Col>
            </Row>
        case ChartType.TEXT_CHART:
            if (fact.focus.length > 0) {
                spec.style = {
                    'focus': fact.focus[0].value,
                }
            }
            // spec.style = {
            // } // 本来value: fact.parameter
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            return <NumberChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>
        case ChartType.VERTICAL_BAR_CHART:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            if (fact.focus.length > 0) {
                spec.style = {
                    'focus': [],
                }
                for (const focus of fact.focus) {
                    spec.style['focus'].push(focus.value)
                }
            }
            return <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>

        default:
            break;
    }
}

// legacy code
export const fact2vis = function (uuid, fact, data, factIndex, width, height, setChartName, updateFact) {
    let spec = _.cloneDeep(defaultSpec);
    const filteredData = datafilter(data, fact.subspace);
    console.log('fact2vis', fact, data, filteredData)

    const updateFactChart = (chartType)=>{
        if (fact.chart == chartType) {
            return
        } else {
            // 初始化
            let newFact = {...fact}
            newFact.chart = chartType
            console.log('updatefactchart', newFact)
            updateFact(newFact, factIndex)
        }
    }

    let candidates = [];
    switch (fact.type.toLowerCase()) {
        case FactType.ASSOCIATION:
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.measure[0].field;
            spec.encoding['x']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[1].field;
            spec.encoding['y']['aggregation'] = fact.measure[1].aggregate;
            spec.style = {
            }
            return <ScatterPlot uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />;

        case FactType.CATEGORIZATION:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = 'COUNT';
            spec.encoding['y']['aggregation'] = 'count';
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'style': 'matrix', // matrix line
            }
            candidates = [
                <BubbleChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />
            ]
            updateFactChart(ChartType.BUBBLE_CHART)
            return candidates[0];

        case FactType.DIFFERENCE:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'difference': [fact.focus[0].value, fact.focus[1].value],
            }
            candidates = [
                <ISOType uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />
            ]
            updateFactChart(ChartType.ISOTYPE_BAR_CHART)
            return candidates[1];

        case FactType.DISTRIBUTION:
            spec.encoding['color'] = {};
            spec.encoding['color']['field'] = fact.measure[0].field;
            spec.encoding['color']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['area'] = {};
            spec.encoding['area']['field'] = fact.breakdown[0];
            candidates = [
                <Map uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <BubbleChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <ISOType uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />
            ]
            if (getMapType(data, spec.encoding) === null) {
                spec.encoding['y'] = {};
                spec.encoding['y']['field'] = fact.measure[0].field;
                spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
                spec.encoding['x'] = {};
                spec.encoding['x']['field'] = fact.breakdown[0];
                spec.style = {
                    'style': 'matrix', // matrix line
                }
                // clear
                spec.encoding['color'] = {};
                spec.encoding['area'] = {};
                updateFactChart(ChartType.ISOTYPE_BAR_CHART)
                return candidates[2];
            } else {
                updateFactChart(ChartType.Map)
                return candidates[0];
            }


        case FactType.EXTREME:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': fact.focus[0].value,
            }
            candidates = [
                <ISOType uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />
            ]
            updateFactChart(ChartType.ISOTYPE_BAR_CHART)
            return candidates[0];

        case FactType.OUTLIER:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'focus': fact.focus[0] ? fact.focus[0].value : '',
            }
            updateFactChart(ChartType.AREA_CHART)
            return <AreaChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />;

        case FactType.PROPORTION:
            let spec1 = _.cloneDeep(spec)
            spec1.encoding['size'] = {};
            spec1.encoding['size']['field'] = fact.measure[0].field;
            spec1.encoding['size']['aggregation'] = fact.measure[0].aggregate;
            spec1.encoding['color'] = {};
            spec1.encoding['color']['field'] = fact.breakdown[0];
            spec1.style = {
                'focus': fact.focus[0].value,
                'style': 'pie', // bar pie donut half_donut
            }
            let spec2 = _.cloneDeep(spec)
            spec2.encoding['y'] = {};
            spec2.encoding['y']['field'] = fact.measure[0].field;
            spec2.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec2.encoding['x'] = {};
            spec2.encoding['x']['field'] = fact.breakdown[0];
            spec2.style = {
                'proportion': fact.focus[0].value,
            }
            candidates = [
                <ProportionChart uuid={uuid} data={filteredData} spec={spec1} width={width} height={height} />,
                <ISOType uuid={uuid} data={filteredData} spec={spec2} width={width} height={height} />,
            ]
            updateFactChart(ChartType.ISOTYPE_BAR_CHART)
            return candidates[1];

        case FactType.RANK:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
                'order': 'descending',
            }
            updateFactChart(ChartType.HORIZONTAL_BAR_CHART)
            return <RankedBarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />;

        case FactType.TREND:
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            spec.encoding['x'] = {};
            spec.encoding['x']['field'] = fact.breakdown[0];
            spec.style = {
            }
            updateFactChart(ChartType.LINE_CHART)
            return <LineChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} setChartName={setChartName}/>;
            
        case FactType.VALUE:
            spec.style = {
                "value": fact.parameter
            }
            spec.encoding['y'] = {};
            spec.encoding['y']['field'] = fact.measure[0].field;
            spec.encoding['y']['aggregation'] = fact.measure[0].aggregate;
            // spec.encoding['x'] = {};
            // spec.encoding['x']['field'] = fact.breakdown[0];
            // spec.style = {
            //     'focus': fact.focus[0].value
            // }
            candidates = [
                <NumberChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <ISOType uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />,
                <BarChart uuid={uuid} data={filteredData} spec={spec} width={width} height={height} />
            ]
            updateFactChart(ChartType.TEXT_CHART)
            return candidates[0];

        default:
            console.log("wrong fact type: " + fact.type)
            break;
    }
}