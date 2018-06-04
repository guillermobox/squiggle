import React from 'react';
import { nuggetStore } from "../Store"
import { NuggetListItem } from './NuggetList';
import { Nugget } from './Nugget';
import { NuggetWebsocket } from './Websocket';

export class Squiggle extends React.Component {
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
  sync(resources) {
    this.setState({ data: resources });
  }
  showNugget(nugget) {
    this.props.router.push('/' + nugget.currentTarget.dataset['nugget']);
  }
  render() {
    const data = this.state['data'];
    const resources = data.map((info, i) => <NuggetListItem callback={this.showNugget.bind(this)} data={info} key={i} />);
    const panels = {};

    data.map((element, i) => {
      panels[element.application.name] = <Nugget data={element} key={i} />;
    });

    return (
      <div id="squiggle-container">
        <nav id="squiggle-nav">
          <header>
            <NuggetWebsocket />
          </header>
          <ul>
            {resources}
          </ul>
          <footer>
          </footer>
        </nav>
        <article id="squiggle-nuggets">
          {panels[this.props.params.nugget]}
        </article>
      </div>
    );
  }
}
