import FactType from "../constant/FactType";

// chart valid
export const isValid = function (fact) {
    let isValid = false;
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
            if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length) // 去掉focus
                isValid = true
            break;

        case FactType.OUTLIER:
            if (fact.measure.length && fact.measure[0].field && fact.measure[0].aggregate && fact.breakdown.length) // 去掉focus
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

    let suffix = '';
    if (num >= 1000000000) { // 大于等于10亿
        num = (num / 1000000000).toFixed(2);
        suffix = 'B';
    } else if (num >= 1000000) { // 大于等于百万
        num = (num / 1000000).toFixed(2);
        suffix = 'M';
    } else if (num >= 1000) { // 大于等于千
        num = (num / 1000).toFixed(2);
        suffix = 'K';
    } else {
        num = num.toFixed(2); // 保留两位小数
    }

    let parts = num.toString().split('.');
    let intNum = parts[0];
    let floatNum = parts.length > 1 ? '.' + parts[1] : '';

    let result = [];
    let counter = 0;

    for (let i = intNum.length - 1; i >= 0; i--) {
        counter++;
        result.unshift(intNum[i]);
        if (!(counter % 3) && i !== 0) {
            result.unshift(',');
        }
    }

    return result.join('') + floatNum + suffix;
};
