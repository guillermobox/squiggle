import React from 'react';
import ReactDOM from 'react-dom';
import { nuggetStore } from "./Store"
import { Router, Route, Link, hashHistory } from "react-router";
import * as Actions from './Actions';
var randomstring = require("randomstring");


import dispatcher from "./Dispatcher"
function constructMessage(state) {
  var message = {};

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

class Nugget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tag: "", input: {}, output: {}, stdin: "", stdout: "", error: "" };

    props.data.input.forEach(element => {
      this.state.input[element.name] = "";
    });
    props.data.output.forEach(element => {
      this.state.output[element.name] = "";
    });
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    dispatcher.subscribe(this.eventHandler.bind(this));
  }
  eventHandler(event) {
    if (event.event == "RECEIVE") {
      var data = JSON.parse(event.data);
      if (data.tag == this.state.tag) {
        this.setState(data);
      }
    }
  }
  handleChange(event) {
    if (event.target.type === 'file') {
      var file = event.target.files[0];
      var reader = new FileReader();
      var inputid = event.target.id;
      reader.onload = function (event) {
        let st = { input: this.state.input };
        st.input[inputid] = event.target.result;
        this.setState(st);
      }.bind(this);
      reader.readAsDataURL(file);
      return;
    }

    let st = { input: this.state.input };
    st.input[event.target.id] = event.target.value;
    this.setState(st);
  }
  handleSubmit(event) {
    var message = constructMessage(this.state);
    message.tag = randomstring.generate({ length: 16, capitalization: 'uppercase', charset: 'hex' });
    message.path = this.props.data.path;
    this.setState({tag: message.tag}, () => {
      Actions.runNugget(message);
    });
    event.preventDefault();
  }
  renderOutputField(data) {

    var input;

    if (data.parser == 'int')
      input = (<input readOnly value={this.state.output[data.name]} onChange={this.handleChange.bind(this)} id={data.name} type="number" placeholder={data.description}></input>);
    else if (data.parser == 'path') 
      input = (<input onChange={this.handleChange} id={data.name} type="file" placeholder={data.description}></input>);
    else if (data.parser == 'image')
      input = <img id={data.name} src={this.state.output[data.name]} />
    else
      input = (<input onChange={this.handleChange} id={data.name} type="text" placeholder={data.description}></input>);

    return (
      <fieldset key={data.name}>
        <legend>{data.name}</legend>
        <label htmlFor={data.name}>{data.description}</label>
        {input}
      </fieldset>
    )
  }
  renderInputField(data) {

    var input;

    if (data.parser == 'int')
      input = (<input value={this.state.input[data.name]} onChange={this.handleChange.bind(this)} id={data.name} type="number"></input>);
    else if (data.parser == 'path') {
      if (data.mimetype.startsWith('image/')) {
        input = (<div><input onChange={this.handleChange.bind(this)} id={data.name} type="file"></input><img src={this.state.input[data.name]} /></div>);
       } else if (data.mimetype.startsWith('text/')) {
        input = (<div><textarea onChange={this.handleChange.bind(this)} id={data.name} value={this.state.input[data.name]} /></div>);
       }
    } else if (data.parser == 'image')
      input = <img id={data.name} />
    else
      input = (<input onChange={this.handleChange} id={data.name} type="text" placeholder={data.description}></input>);

    return (
      <fieldset key={data.name}>
        <legend>{data.name}</legend>
        <label htmlFor={data.name}>{data.description}</label>
        {input}
      </fieldset>
    )
  }

  render() {
    return (
      <div>
        <h3>{this.props.data.application.name}</h3>
        <p>{this.props.data.path}: {this.props.data.application.description}</p>
        <code>TAG: {this.state.tag} </code>
        <form onSubmit={this.handleSubmit}>
          {this.props.data.input.map(this.renderInputField.bind(this))}
          <input type="submit"></input>
        </form>
        <form>
          {this.props.data.output.map(this.renderOutputField.bind(this))}
        </form>
        <pre>{this.state.stdin}</pre>
        <pre>{this.state.stdout}</pre>
        <pre>{this.state.stderr}</pre>
        <pre>{JSON.stringify(this.props.data, null, 4)}</pre>
      </div>
    )
  }
}

class NuggetList extends React.Component {
  constructor() {
    super();
    this.state = { data: [] };
    this.sync = this.sync.bind(this);
  }
  componentWillMount() {
    nuggetStore.on("sync", this.sync)
  }
  componentWillUmount() {
    nuggetStore.off("sync", this.sync)
  }
  componentDidMount() {
  }
  sync(resources) {
    this.setState({ data: resources });
  }
  render() {
    const data = this.state['data'];
    const resources = data.map((info, i) => <Nugget data={info} key={i} />);
    return (
      <ul>
        {resources}
      </ul>
    );
  }
}

class NuggetWebsocket extends React.Component {
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
  componentWillUnmount() {

  }
  render() {
    return (
      <div>
        {this.state.connected ? 'connected' : 'not connected'}
      </div>
    )
  }
}

ReactDOM.render((
  <Router history={hashHistory} >
    <Route path="/" component={NuggetList}>
      <Route path="/show/:id" component={Nugget} />
    </Route>
  </Router>
), document.getElementById('squiggle'));

ReactDOM.render((
  <NuggetWebsocket />
), document.getElementById('squigglehead'));

function addNugget(url) {
  $.get(url, function (nugget) {
    $('#nuggetList').html(nugget);
  });
}

function test(x) {
  $.get('/nugget/', function (data) {
    addNugget(data.nuggets[0]);
  });
}
