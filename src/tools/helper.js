import FactType from "../constant/FactType";

// chart valid
export const isValid = function (fact) {
    let isValid = false;
    if (fact.type) {
        switch (fact.type.toLowerCase()) {
            case FactType.ASSOCIATION:
                if (fact.measure.length === 2 && fact.breakdown.length)
                    isValid = true
                break;

            case FactType.CATEGORIZATION:
                if (fact.breakdown.length)
                    isValid = true
                break;

            case FactType.DIFFERENCE:
                if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length && fact.focus.length >= 2)
                    isValid = true
                break;

            case FactType.DISTRIBUTION:
                if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length)
                    isValid = true
                break;

            case FactType.EXTREME:
                if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length && fact.focus.length) // 去掉focus
                    isValid = true
                break;

            case FactType.OUTLIER:
                if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length && fact.focus.length) // 去掉focus
                    isValid = true
                break;

            case FactType.PROPORTION:
                if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length && fact.focus.length)
                    isValid = true
                break;

            case FactType.RANK:
                if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length)
                    isValid = true
                break;

            case FactType.TREND:
                // 去掉breakdown.length?
                if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length)
                    isValid = true
                break;

            case FactType.VALUE:
                if (fact.measure.length)
                    isValid = true
                break;

            default:
                break;
        }
    }
    return isValid
}

// 清空不必要的fact属性
export const customizeFact = function (fact) {
    let newFact = Object.assign({}, fact)
    switch (fact.type.toLowerCase()) {
        case FactType.ASSOCIATION:
            newFact.focus = []
            break;

        case FactType.CATEGORIZATION:
            newFact.measure = []
            newFact.focus = []
            break;

        case FactType.DIFFERENCE:
            break;

        case FactType.DISTRIBUTION:
            newFact.focus = []
            break;

        case FactType.EXTREME:
            break;

        case FactType.OUTLIER:
            break;

        case FactType.PROPORTION:
            break;

        case FactType.RANK:
            newFact.focus = []
            break;

        case FactType.TREND:
            newFact.focus = []
            break;

        case FactType.VALUE:
            newFact.breakdown = []
            newFact.focus = []
            break;

        default:
            break;
    }
    return newFact
}

// fact valid for score to update(RANK/PROPORTION/OUTLIER/DIFFERENCE)
export const isFactValid = function (_fact) {
    let fact = Object.assign({}, _fact)
    let isFactValid = false;
    switch (fact.type.toLowerCase()) {
        case FactType.ASSOCIATION:
            if (fact.measure.length === 2 && fact.breakdown)
                isFactValid = true
            break;

        case FactType.CATEGORIZATION:
            if (fact.breakdown)
                isFactValid = true
            break;

        case FactType.DIFFERENCE:
            if (fact.measure && fact.breakdown && fact.focus.length >= 2)
                isFactValid = true
            break;

        case FactType.DISTRIBUTION:
            if (fact.measure && fact.breakdown)
                isFactValid = true
            break;

        case FactType.EXTREME:
            if (fact.measure && fact.breakdown)
                isFactValid = true
            break;

        case FactType.OUTLIER:
            if (fact.measure && fact.breakdown && fact.focus.length)
                isFactValid = true
            break;

        case FactType.PROPORTION:
            if (fact.measure && fact.breakdown && fact.focus.length)
                isFactValid = true
            break;

        case FactType.RANK:
            if (fact.measure.length && fact.breakdown.length && fact.focus.length >= 3)
                isFactValid = true
            break;

        case FactType.TREND:
            if (fact.measure && fact.breakdown)
                isFactValid = true
            break;

        case FactType.VALUE:
            if (fact.measure)
                isFactValid = true
            break;

        default:
            break;
    }
    return isFactValid
}

// 输入d3的数字需要进行规范
// export const formatNum = function (num) {
//     num = (num || 0).toString();
//     let number = 0,
//         floatNum = '',
//         intNum = '';
//     if (num.indexOf('.') > 0) {
//         number = num.indexOf('.');
//         floatNum = num.substr(number);
//         intNum = num.substring(0, number);
//     } else {
//         intNum = num;
//     }
//     let result = [],
//         counter = 0;
//     intNum = intNum.split('');

//     for (let i = intNum.length - 1; i >= 0; i--) {
//         counter++;
//         result.unshift(intNum[i]);
//         if (!(counter % 3) && i !== 0) { result.unshift(','); }
//     }
//     return result.join('') + floatNum || '';
// }

export const formatNum = function (num) {
    if (num === null || num === undefined) {
        return '0';
    }

    // 将字符串转换为数字类型以进行后续处理
    num = parseFloat(num);

    const isNegative = num < 0;
    num = Math.abs(num);

    let suffix = '';
    if (num >= 1000000000000) {
        num = num / 1000000000000
        suffix = 'T'
    } else if (num >= 1000000000) { // 大于等于10亿
        num = num / 1000000000;
        suffix = 'B';
    } else if (num >= 1000000) { // 大于等于百万
        num = num / 1000000;
        suffix = 'M';
    } else if (num >= 1000) { // 大于等于千
        num = num / 1000
        suffix = 'K';
    } 

    let numString = num.toString();
    let parts = numString.split('.');

    if (parts.length > 1 && parts[1].length > 2) {
        numString = num.toFixed(2);
        parts = numString.split('.');
    }

    let intNum = parts[0];
    let floatNum = parts.length > 1 ? '.' + parts[1] : '';

    // Add commas for thousands separators
    let result = [];
    let counter = 0;

    for (let i = intNum.length - 1; i >= 0; i--) {
        counter++;
        result.unshift(intNum[i]);
        if (!(counter % 3) && i !== 0) {
            result.unshift(',');
        }
    }

    if (isNegative) {
        result.unshift('-');
    }

    return result.join('') + floatNum + suffix;
};

// 从返回的结果进行json提取
export const extract_Res = function (response) {
    let response_data
    if (typeof response.data === 'string') {
      try {
        console.log('response data', response.data)
        let parsed_data = JSON.parse(response.data);
        response_data = parsed_data.data
      } catch (error) {
        console.error('Failed to parse JSON:', error);
      }
    } else {
      response_data = response.data.data
    }
    const { retrieveList } = response_data
    return retrieveList
}

// 根据立场程度计算颜色
export const getColor = function (stance) {
    let color = {
        h: stance?.label == 'support'? 170 : 340,
        s: 55,
        l: 55,
    }
    if (stance?.label == 'support' && stance.score) {
        let score = stance.score  // 如果stance.score不在0-1之间，需要再调整下
        if (score >= 5 && score <= 10) {
            score = score / 10;
        } else if (score >= 50 && score <= 100) {
            score = score / 100;
        } else if (score > 100 || score < 0.5) {
            score = 0.5
        }
        color.h = 170
        color.s = 15 + (score - 0.5) / 0.5 * (100-15) 
        color.l = 85 - (score - 0.5) / 0.5 * (85-15)
    } else if (stance?.label == 'oppose' && stance.score) {
        let score = stance.score  
        if (score >= 5 && score <= 10) {
            score = score / 10;
        } else if (score >= 50 && score <= 100) {
            score = score / 100;
        } else if (score > 100 || score < 0.5) {
            score = 0.5
        }
        color.h = 340
        // color.s = 30 + (score - 0.5) / 0.5 * (70-30) 
        // color.l = 80 - (score - 0.5) / 0.5 * (80-40) 
        color.s = 15 + (score - 0.5) / 0.5 * (100-15) 
        color.l = 85 - (score - 0.5) / 0.5 * (85-15)
    }
    return color
}

// 计算当前节点的相关性和立场（先排序，然后默认选第一个）
export const calcStanceAndRel = (facts, stance) => {
    const newFacts = facts.sort((a, b) => {
        if (a.stance.label === stance && b.stance.label !== stance) {
            return -1;
        }
        if (a.stance.label !== stance && b.stance.label === stance) {
            return 1;
        }
        return b.relevance - a.relevance;
    });
    const curStance = newFacts.length ? newFacts[0].stance.label : stance
    const score = newFacts.length ? newFacts[0].stance.score : 0.5
    const relevance = newFacts.length ? newFacts[0].relevance : 0.5
    const scale = 90/200 + relevance * (310-90)/200 
    return {relevance: relevance, stance: {label: curStance, score: score}, scale: scale}
}

export const calFactsAndFieldsCnt = (nodes) => {
    const supportFacts = [], opposeFacts = []
    const supportFields = [], opposeFields = []
    for (let i=0; i<nodes.length; i++) {
        let node = nodes[i]
        let nodeFacts = node?.data?.facts
        if (nodeFacts && nodeFacts.length) {
        for (let fact of nodeFacts) {
            if (isValid(fact.fact) && fact.relevance >= 0.65) {
                if (fact.stance.label=='support') {
                    supportFacts.push(fact)
                    if (fact?.fact?.measure && fact.fact.measure.length > 0) {
                        fact.fact.measure.forEach(measure => {
                            supportFields.push(measure.field)
                        });
                    }
                } else {
                    opposeFacts.push(fact)
                    if (fact?.fact?.measure && fact.fact.measure.length > 0) {
                        fact.fact.measure.forEach(measure => {
                            opposeFields.push(measure.field)
                        });
                    }
                }
            }
        }}
    }
    let newSupportFields = [...new Set(supportFields)]
    let newOpposeFields = [...new Set(opposeFields)]
    return {
        support: {facts: supportFacts.length || 0, fields: newSupportFields.length || 0},
        oppose: {facts: opposeFacts.length || 0, fields: newOpposeFields.length || 0}
    }
}
