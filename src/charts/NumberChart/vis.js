import * as d3 from 'd3';
import Color from '../../constant/Color';
import { getAggregatedRows } from './helper';
import { formatNum } from '../../tools/helper';

const offset = 20; // To show whole chart

const draw = (props) => {
    const chartName = 'vis-number-'+props.uuid
    props.setChartName(chartName)
    d3.select('.vis-number-' + props.uuid + ' > *').remove();
    let a = '.vis-number-' + props.uuid;
    const style = props.spec.style;
    let data = props.data

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = props.width - margin.left - margin.right - offset;
    const height = props.height - margin.top - margin.bottom - offset;
    let svg = d3.select(a)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Get Encoding
    const encoding = props.spec.encoding;
    if (encoding.y.aggregation === 'count') {
        encoding.y.field = 'COUNT';
    }

    // 取data[0]的field作为number
    let number = 0
    data = getAggregatedRows(data, encoding);
    if (data.length > 0) {
        number = data[0][encoding.y.field]
    }

    // // Process Data
    // if ('focus' in style) {
    //     data = data.filter((d) => (d[encoding.x.field].toString() == style['focus']))
    //     number = data.length>0 ? data[0][encoding.y.field] : 0
    // } else if (data.length > 0) {
    //     number = data[0][encoding.y.field]
    // }
    number = formatNum(number);
    

    // Style
    // highlight
    let screenWidth = props.width;
    let screenHeight = props.height;
    let textLength = number.length;
    let fontSize = 1.5 * (screenWidth / textLength);
    if (fontSize > 40) {
        fontSize = 40
    }
  
    // textFontSize
    let textFontSize = 30 * screenWidth / 200
    if(encoding.y.field.length > 13) {
        textFontSize = 20 * screenWidth / 200
    }

    // svg.append("text")
    //     .text(encoding.y.field)
    //     .attr("text-anchor", "middle")
    //     .attr("y", screenHeight / 2 - textFontSize)
    //     .attr("x", width / 2)
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", textFontSize + "px")
    //     .attr("fill", Color.BAR)
    //     .style("font-weight", "bold");
    
    let maxCharsPerLine = 20;
    let lines = [];
    let words = encoding.y.field.split(" ");
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        if ((currentLine + " " + word).length <= maxCharsPerLine) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    
    lines.forEach((line, index) => {
        svg.append("text")
            .text(line)
            .attr("text-anchor", "middle")
            .attr("y", screenHeight / 2 + (index - lines.length) * textFontSize)
            .attr("x", width / 2)
            .attr("font-family", "sans-serif")
            .attr("font-size", textFontSize + "px")
            .attr("fill", Color.BAR)
            .style("font-weight", "bold");
    });

    svg.append("text")
        .text(number)
        .attr("text-anchor", "middle")
        .attr("y", screenHeight / 2 + fontSize / 2)
        .attr("x", width / 2)
        .attr("font-family", "sans-serif")
        .attr("font-size", fontSize + "px")
        .attr("fill", Color.BAR_HIGHTLIGHT)
        .style("font-weight", "bold");


    return svg;
}

export default draw;