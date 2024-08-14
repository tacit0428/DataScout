import React, { Component } from 'react';
import draw from './vis';

export default class NumberChart extends Component {

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
            <div className={'vis-number-' + this.props.uuid} style={{display: 'flex', justifyContent: 'center'}}/>
        )
    }
}