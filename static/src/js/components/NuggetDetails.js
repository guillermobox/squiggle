import React from 'react';
import { Button, Collapse, Tabs, Tab } from "@blueprintjs/core";

export class NuggetDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            selectedTabId: 'yaml'
        };

        this.handleNavbarTabChange = this.handleNavbarTabChange.bind(this);
        this.handleShowmore = this.handleShowmore.bind(this);
    }
    handleNavbarTabChange(newtab) {
        this.setState({ selectedTabId: newtab });
    }
    handleShowmore() {
        this.setState((prevState, props) => ({
            isOpen: !prevState.isOpen,
        }));
    }
    render() {
        return (
            <div>
                <Button
                    icon={this.state.isOpen ? "chevron-up" : "chevron-down"}
                    minimal={true}
                    className="pt-fill"
                    onClick={this.handleShowmore}>
                    Show {this.state.isOpen ? "less" : "more"} details
                </Button>
                <Collapse isOpen={this.state.isOpen}>
                    <Tabs id="TabsExample" selectedTabId={this.state.selectedTabId} onChange={this.handleNavbarTabChange}>
                        <Tab id="yaml" title="Definition file" panel={<pre className="tabpre">{JSON.stringify(this.props.yaml, null, 4)}</pre>} />
                        <Tab id="out" disabled={this.props.stdout == ""} title="Standard output" panel={<pre className="tabpre">{this.props.stdout}</pre>} />
                        <Tab id="err" disabled={this.props.stderr == ""} title="Standard error" panel={<pre className="tabpre">{this.props.stderr}</pre>} />
                    </Tabs>
                </Collapse>
            </div>);
    }
}