import React from 'react';
import ReactDOM from 'react-dom';
import { nuggetStore } from "./Store"
import { Router, Route, Link, hashHistory } from "react-router";

class Nugget extends React.Component {
  render () {
    return (
      <li>{this.props.data.application.name} ({this.props.data.application.commandline})</li>
    )
  }
}

class NuggetList extends React.Component {
  constructor () {
    super();
    this.state = {data:[]};
    this.sync = this.sync.bind(this);
  }
  componentWillMount() {
    nuggetStore.on("sync", this.sync)
  }
  componentWillUmount() {
    nuggetStore.off("sync", this.sync)
  }
  sync (resources) {
    this.setState({data:resources});
  }
  render() {
    const data = this.state['data'];
    const resources = data.map((info,i) => <Nugget data={info} key={i} />);
    return (
      <ul>
     {resources}
      </ul>
    );
  }
}


ReactDOM.render((
<Router history={hashHistory} >
  <Route path="/" component={NuggetList}>
    <Route path="/show/:id" component={Nugget} />
  </Route>
</Router>
), document.getElementById('squiggle'));

function addNugget(url) {
  $.get(url, function(nugget) {
    $('#nuggetList').html(nugget);
  });
}

function test(x) {
  $.get('/nugget/', function(data){
    addNugget(data.nuggets[0]);
  });
}
