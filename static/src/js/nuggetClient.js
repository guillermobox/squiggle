import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, hashHistory } from "react-router";

import { Squiggle } from './components/Squiggle';
import { FocusStyleManager } from "@blueprintjs/core";
 
FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.render((
  <Router history={hashHistory} >
    <Route path="/:nugget" component={Squiggle}></Route>
    <Route path="/" component={Squiggle}></Route>
  </Router>
), document.getElementById('squiggle'));