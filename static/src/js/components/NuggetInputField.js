import React from 'react';

import { ButtonGroup, Collapse, Tabs, Tab, AnchorButton, Button, NumericInput, FormGroup, TextArea, Code, H5, Intent, Switch, FileInput } from "@blueprintjs/core";

function renderNumericInput() {
    return (
        <NumericInput
            className="pt-fill"
            value={this.state.value}
            onValueChange={this.handleChange.bind(this)}
            id={this.props.data.name}>
        </NumericInput>
    );
}

function renderFileInput() {
    if (this.props.data.mimetype.startsWith('image/')) {
        return (
            <div>
                <FileInput
                    className="pt-fill"
                    inputProps={{ onChange: this.handleFileChange.bind(this) }}>
                </FileInput>
                <img src={this.state.value} />
            </div>
        );
    } else if (this.props.data.mimetype.startsWith('text/')) {
        let editorpath = "editor-" + this.props.data.name;
        this.editors.push(editorpath);
        return (
            <div
                className="aceeditor"
                id={editorpath}>
            </div>
        );
    }
}

let renderers = {
    int: renderNumericInput,
    path: renderFileInput,
}

export class NuggetInputField extends React.Component {

    constructor(props) {
        super(props);
        this.editors = [];
        this.state = {
            value: "",
        }
    }
    componentDidMount() {
        this.editors.forEach((element) => {
            var editor = ace.edit(element);
            editor.session.on('change', (delta) => {
                const value = editor.getValue();
                this.setState({value: value}, this.communicateParent.bind(this));
            })
        });
    }
    handleChange(event) {
        let value;

        if (this.props.data.parser === 'int')
            value = event;
        else
            value = event.target.value

        this.setState({value: value}, this.communicateParent.bind(this));
    }
    communicateParent () {
        this.props.onValidChange(this.props.data.name, this.state.value);
    }
    handleFileChange(event) {
        var file = event.target.files[0];
        event.target.parentNode.getElementsByClassName('pt-file-upload-input')[0].innerText = file.name;
        var reader = new FileReader();
        reader.onload = function (event) {
            this.setState({ value: event.target.result });
            this.communicateParent();
        }.bind(this);
        reader.readAsDataURL(file);
    }
    render() {
        let input;

        if (this.props.data.parser in renderers)
            input = renderers[this.props.data.parser].bind(this)();
        else
            input = (
                <input
                    onChange={this.handleChange}
                    id={this.props.data.name}
                    type="text">
                </input>
            );

        return (
            <FormGroup label={this.props.data.description}>
                {input}
            </FormGroup>
        )
    }
}