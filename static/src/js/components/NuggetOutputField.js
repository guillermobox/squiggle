import React from 'react';

import { FormGroup } from "@blueprintjs/core";

function renderImageOutput() {
    return (
        <img src={this.props.value} />
    );
}

let renderers = {
    image: renderImageOutput,
}

export class NuggetOutputField extends React.Component {
    render() {
        let output;

        if (this.props.data.parser in renderers)
            output = renderers[this.props.data.parser].bind(this)();
        else
            output = (
                <input
                    className="pt-input pt-fill"
                    readOnly={true}
                    id={this.props.data.name}
                    type="text"
                    value={this.props.value}>
                </input>
            );

        return (
            <FormGroup label={this.props.data.description}>
                {output}
            </FormGroup>
        )
    }
}