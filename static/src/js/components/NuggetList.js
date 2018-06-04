import React from 'react';

export class NuggetListItem extends React.Component {
  render() {
    return (
      <li className="pt-card pt-elevation-2" data-nugget={this.props.data.application.name} onClick={this.props.callback}>
        <h5>{this.props.data.application.name}</h5>
        {this.props.data.application.description}
      </li>
    )
  }
}
