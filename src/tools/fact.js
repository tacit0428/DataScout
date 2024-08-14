export default class Fact {
    constructor(type, measure = [], subspace = [], breakdown= [], focus = [],  chart = "") {
        this.type = type;
        this.measure = measure;
        this.subspace = subspace;
        this.breakdown = breakdown;
        this.focus = focus;
        this.chart = chart;
    }
}