import React from 'react';
import * as Actions from '../Actions';
import dispatcher from "../Dispatcher";

export class NuggetWebsocket extends React.Component {
  constructor() {
    super();
    this.state = { connected: false };
  }
  componentDidMount() {
    this.connection = new WebSocket('ws://localhost:3000/nugget/')
    this.connection.onopen = function (event) {
      this.setState({ connected: true });
    }.bind(this);
    this.connection.onclose = function (event) {
      this.setState({ connected: false });
    }.bind(this);
    this.connection.onmessage = function (event) {
      Actions.receiveNugget(event.data);
    }
    dispatcher.subscribe(this.eventHandler.bind(this));
  }
  eventHandler(event) {
    if (event.event == "RUN") {
      this.connection.send(JSON.stringify(event.data));
    }
  }
  render() {
    const image = this.state.connected ? 'images/squiggle-connected.png' : 'images/squiggle-disconnected.png';
    const title = this.state.connected ? 'Squiggle connected' : 'Connection lost!';
    return (
      <React.Fragment>
        <img src={image}/>
        <div>{title}</div>
      </React.Fragment>
    );
  }
}