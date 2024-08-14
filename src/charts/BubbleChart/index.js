import React, { Component } from 'react';
import draw from './vis';

export default class BubbleChart extends Component {

    componentDidMount() {
        try {
            draw(this.props);
        } catch (error) {
        }
    }

    componentDidUpdate(preProps) {
        try {
            draw(this.props);
        } catch (error) {
        }
    }

    render() {
        return (
            <div className={'vis-bubblechart-' + this.props.uuid} style={{display: 'flex', justifyContent: 'center'}}/>
        )
    }
}