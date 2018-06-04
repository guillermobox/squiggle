import React from 'react';
import * as Actions from '../Actions';
import dispatcher from "../Dispatcher";
import randomstring from 'randomstring';

import { NuggetDetails } from './NuggetDetails';
import { NuggetInputField } from './NuggetInputField';
import { NuggetOutputField } from './NuggetOutputField';

import { Button } from "@blueprintjs/core";

function constructMessage(state) {
  let message = {};

  message.tag = state.tag;
  message.input = [];

  for (var element in state.input) {
    message.input.push({
      name: element,
      value: state.input[element]
    });
  };

  return message;
}

export class Nugget extends React.Component {
  constructor(props) {
    super(props);

    this.state = { input: {}, output: {}, stdin: "", stdout: "", stderr: "" };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
  }
  componentDidMount() {
    dispatcher.subscribe(this.eventHandler);
  }
  eventHandler(event) {
    if (event.event == "RECEIVE") {
      var data = JSON.parse(event.data);
      if (data.tag == this.tag) {
        this.setState(data);
      }
    }
  }
  handleSubmit(event) {
    event.preventDefault();

    let message = constructMessage(this.state);
    message.tag = randomstring.generate({ length: 16, capitalization: 'uppercase', charset: 'hex' });
    message.path = this.props.data.path;
    this.tag = message.tag;
    Actions.runNugget(message);
  }
  validValueHandle(name, value) {
    let input = this.state.input;
    input[name] = value;
    this.setState(input);
  }
  render() {
      let a = [];
    return (
      <div>
        <h2>{this.props.data.application.name}</h2>
        <p>{this.props.data.application.description}</p>
        <form onSubmit={this.handleSubmit}>
          {this.props.data.input.map((element,id) => (<NuggetInputField onValidChange={this.validValueHandle.bind(this)} data={element} key={id} />))}
          <Button className="pt-fill" icon="chevron-down" intent="primary" type="submit">Launch</Button>
        </form>
        <form>
        {this.props.data.output.map((element,id) => (<NuggetOutputField data={element} value={this.state.output[element.name] || ""} key={id} />))}

        </form>
        <hr />
        <NuggetDetails yaml={this.props.data} stdout={this.state.stdout} stderr={this.state.stderr} />
      </div>
    )
  }
}
