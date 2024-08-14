import * as d3 from 'd3';
import _ from 'lodash';

const getCategories = (rawData, encoding) => {
    let dataCategories = {}
    for (let i = 0; i < rawData.length; i++) {
        if (dataCategories[rawData[i][encoding.x.field]]) {
            dataCategories[rawData[i][encoding.x.field]].push(rawData[i]);
        }
        else {
            dataCategories[rawData[i][encoding.x.field]] = [rawData[i]];
        }
    }
    return dataCategories;
}

const getSeries = (rawData, encoding) => {
    let dataSeries = {}
    for (let i = 0; i < rawData.length; i++) {
        if (dataSeries[rawData[i][encoding.color.field]]) {
            dataSeries[rawData[i][encoding.color.field]].push(rawData[i]);
        }
        else {
            dataSeries[rawData[i][encoding.color.field]] = [rawData[i]];
        }
    }
    return dataSeries;
}
const getSeriesValue = (rawData, encoding) => {
    if(('color' in encoding) && !_.isEmpty(encoding.color)){
        return Array.from(new Set(rawData.map(d => d[encoding.color.field])));}
    else return [];
}

const getMinRows = (rawData, encoding) => {
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let data = calculateData.map(function (d) {
        let index = d3.scan(d.values, function(a, b) {
            if(a[encoding.y.field] && b[encoding.y.field])
                return a[encoding.y.field]- b[encoding.y.field]; 
            });
        if(index >= 0) return d.values[index]
        // index === 'undefined'
        else {
            return d.values[0]
        }
    });
    return data;
}

const getMaxRows = (rawData, encoding) =>{
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let data = calculateData.map(function (d,i) {
        let index = d3.scan(d.values, function(a, b) {
            if(a[encoding.y.field] && b[encoding.y.field])
                return b[encoding.y.field]- a[encoding.y.field]; 
            });
        if(index >= 0) return d.values[index]
        // index === 'undefined'
        else {
            return d.values[0];
        }
    });
    return data;
}

const getSumRows = (rawData, encoding) =>{
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let sumData = new Array(calculateData.length).fill(0);
    let data = calculateData.map(function (d,i) {
        d.values.forEach(d=>{
            sumData[i] += d[encoding.y.field]
        })
        let sumRows = Object.assign({},d.values[0])
        sumRows[encoding.y.field] = sumData[i]
        return sumRows
    });
    return data;
}

const getAverageRows = (rawData, encoding) =>{
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let sumData = new Array(calculateData.length).fill(0);
    let data = calculateData.map(function (d,i) {
        d.values.forEach(d=>{
            sumData[i] += d[encoding.y.field]
        })
        let sumRows = Object.assign({},d.values[0])
        sumRows[encoding.y.field] = sumData[i] / d.values.length;
        return sumRows;
    });
    return data;
}

const getCountRows = (rawData, encoding) => {
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let countData = new Array(calculateData.length).fill(0);
    let data = calculateData.map(function (d,i) {
        d.values.forEach(() => {
            countData[i] += 1
        })
        let countRows = Object.assign({},d.values[0])
        countRows['COUNT'] = countData[i]
        return countRows
    });
    return data;
}

const getAggregatedRows = (rawData, encoding) => {
    let data;
    switch (encoding.y.aggregation) {
        case 'sum':
            data = getSumRows(rawData, encoding);
            break;
        case 'avg':
            data = getAverageRows(rawData, encoding);
            break;
        case 'max':
            data = getMaxRows(rawData, encoding);
            break;
        case 'min':
            data = getMinRows(rawData, encoding);
            break;
        case 'count':
            data = getCountRows(rawData, encoding);
            break;
        case 'none':
            data = getMaxRows(rawData, encoding);
            break;

        default:
            data = getMaxRows(rawData, encoding);
            break;
    }
    return data;
}



export {getCategories, getSeries, getAggregatedRows, getMaxRows, getSeriesValue}