import React, { Component } from 'react';
import draw from './vis';

export default class AreaChart extends Component {

    componentDidMount() {
        try {
            draw(this.props);
            console.log('mount draw')
        } catch (error) {
        }
    }

    componentDidUpdate(preProps) {
        try {
            draw(this.props);
            console.log('update draw')
        } catch (error) {
        }
    }

    render() {
        return (
            <div className={'vis-areachart-' + this.props.uuid} style={{display: 'flex', justifyContent: 'center'}}/>
        )
    }
}