import * as React from 'react';
import { Component } from 'react';
import Sidebar from '../components/Sidebar';
import '../scss/Employeeview.scss';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
    SPHttpClient,
    SPHttpClientResponse
} from '@microsoft/sp-http';
import * as microsoftTeams from "@microsoft/teams-js";
import Champions from './Champions';
import siteconfig from "../config/siteconfig.json";
interface EmployeeViewState {
    siteUrl: string;
    users: any;
    isLoaded: boolean;
    search: "";
    filteredUsers: any;
    cb: boolean;
    Clb: boolean;
    sitename: string;
    inclusionpath: string;
}
interface EmployeeViewProps {
    context: WebPartContext;
    onClickCancel: () => void;
}
export default class EmployeeView extends Component<EmployeeViewProps, EmployeeViewState> {
    constructor(props: any) {
        super(props);
        this.state = {
            siteUrl: this.props.context.pageContext.web.absoluteUrl.replace(this.props.context.pageContext.web.serverRelativeUrl, ''),
            isLoaded: false,
            users: [],
            search: "",
            filteredUsers: [],
            cb: false,
            Clb: false,
            sitename: siteconfig.sitename,
            inclusionpath: siteconfig.inclusionPath,
        };
        this.onchange = this.onchange.bind(this);
        this._renderListAsync();
    }

    public _renderListAsync() {
        microsoftTeams.initialize();
        this.props.context.spHttpClient.get(this.state.siteUrl + "/_api/web/lists/GetByTitle('Member List')/Items", SPHttpClient.configurations.v1)
            .then((response: SPHttpClientResponse) => {
                response.json().then(datada => {
                    if (!datada.error) {
                        this.props.context.spHttpClient.get(this.state.siteUrl + "/" + this.state.inclusionpath + "/" + this.state.sitename + "/_api/web/lists/GetByTitle('Events List')/Items", SPHttpClient.configurations.v1)
                            .then((responseevents: SPHttpClientResponse) => {
                                responseevents.json().then(eventsdata => {
                                    if (!eventsdata.error) {
                                        if (eventsdata && eventsdata.value.length > 0) {
                                            this.setState({ users: datada.value, isLoaded: true });
                                        }
                                    }
                                });
                            });
                    }
                });
            });
    }

    public onchange = (value: any) => {
        if (value) {
            this.setState({
                search: value, filteredUsers: this.state.users.filter(x => x.FirstName && x.FirstName.toLowerCase().includes(value.toLowerCase()) || x.Country && x.Country.toLowerCase().includes(value.toLowerCase()) || x.FocusArea && x.FocusArea.toLowerCase().includes(value.toLowerCase()) || x.Group && x.Group.toLowerCase().includes(value.toLowerCase())
                )
            });

        } else {
            this.setState({ filteredUsers: [], search: '' });
        }
    }

    public render() {
        return (
            <div className="Employeeview d-flex ">
                <Sidebar context={this.props.context} becomec={true} onClickCancel={() => this.props.onClickCancel()} />
                {this.state.isLoaded && <div className="main">
                    <SearchBox placeholder="Search" onChange={this.onchange} className="search" />
                    <Champions users={this.state.search ? this.state.filteredUsers : this.state.users} type={''} fromV={'e'} />
                </div>}
            </div>
        );
    }
}
