import React, { Component } from 'react';
import draw from './vis';
import drawProportion from './proportion';

export default class ISOType extends Component {

    componentDidMount() {
        try {
            if (this.props.spec.style && 'proportion' in this.props.spec.style) {
                drawProportion(this.props);
            } else {
                draw(this.props);
            }
        } catch (error) {

        }
    }

    componentDidUpdate(preProps) {
        try {
            if (this.props.spec.style && 'proportion' in this.props.spec.style) {
                drawProportion(this.props);
            } else {
                draw(this.props);
            }
        } catch (error) {

        }
    }

    render() {
        return (
            <div className={'vis-isotype-' + this.props.uuid} style={{display: 'flex', justifyContent: 'center'}}/>
        )
    }
}