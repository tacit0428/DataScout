import React, { Component } from 'react';
import draw from './vis';

export default class BarChart extends Component {

    componentDidMount() {
        try {
            draw(this.props);
        } catch (error) {
        }
    }

    componentDidUpdate() {
        try {
            draw(this.props);
        } catch (error) {
        }
    }

    render() {
        return (
            <div className={'vis-barchart-' + this.props.uuid} style={{display: 'flex', justifyContent: 'center'}}/>
        )
    }
}