import {promiseGet, promisePost} from "@cervoio/common-ui-lib/src/utilities";
import {NewZooJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {getAuthCookie} from "./lib/authCheck";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {LoginStatus} from "./components/loginStatus";
import {ChangeEvent, FormEvent} from "react";


interface ZooFormProps {
    onNewZoo: (newZoo: NewZooJson) => Promise<void>;
}

interface ZooFormState {
    name: string,
    postcode: string,
    latitude: string,
    longitude: string,
    link: string
}

interface ZooTableProps {
    zooList: ZooJson[];
    onNewZoo: (newZoo: NewZooJson) => Promise<void>;
}

interface ZooRowProps {
    zoo: ZooJson;
}

interface ZooListPageState {
    isLoading: boolean;
    zooList: ZooJson[];
}

class ZooFormRow extends React.Component<ZooFormProps, ZooFormState> {
    constructor(props: ZooFormProps) {
        super(props);
        this.state = {name: "", postcode: "", latitude: "", longitude: "", link: ""};
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangePostcode = this.onChangePostcode.bind(this);
        this.onChangeLink = this.onChangeLink.bind(this);
        this.onChangeLatitude = this.onChangeLatitude.bind(this);
        this.onChangeLongitude = this.onChangeLongitude.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChangeName(e: ChangeEvent<HTMLInputElement>) {
        this.setState({name: e.target.value});
    }

    onChangePostcode(e: ChangeEvent<HTMLInputElement>) {
        this.setState({postcode: e.target.value});
    }

    onChangeLink(e: ChangeEvent<HTMLInputElement>) {
        this.setState({link: e.target.value});
    }

    onChangeLatitude(e: ChangeEvent<HTMLInputElement>) {
        this.setState({latitude: e.target.value});
    }

    onChangeLongitude(e: ChangeEvent<HTMLInputElement>) {
        this.setState({longitude: e.target.value});
    }

    async onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const newZoo = {
            name: this.state.name,
            postcode: this.state.postcode,
            link: this.state.link,
            latitude: Number(this.state.latitude),
            longitude: Number(this.state.longitude)
        };
        await this.props.onNewZoo(newZoo);
        this.setState({name: "", postcode: "", latitude: "", longitude: "", link: ""});
    }

    render() {
        return <tfoot>
            <tr>
                <td><form id='addZoo' onSubmit={this.onSubmit}><input type='text' value={this.state.name} onChange={this.onChangeName} /></form></td>
                <td><input form='addZoo' type='text' value={this.state.postcode} onChange={this.onChangePostcode} /></td>
                <td><input form='addZoo' type='text' value={this.state.latitude} onChange={this.onChangeLatitude} /></td>
                <td><input form='addZoo' type='text' value={this.state.longitude} onChange={this.onChangeLongitude} /></td>
                <td>
                    <input form='addZoo' type='text' value={this.state.link} onChange={this.onChangeLink} />
                    <input form='addZoo' type='submit' />
                </td>
            </tr>
        </tfoot>
    }
}

class ZooTableRow extends React.Component<ZooRowProps, {}> {
    render() {
        return <tr>
            <td><a href={`view_zoo.html?id=${this.props.zoo.zoo_id}`}>{this.props.zoo.name}</a></td>
            <td>{this.props.zoo.postcode}</td>
            <td>{this.props.zoo.latitude}</td>
            <td>{this.props.zoo.longitude}</td>
            <td><a href={this.props.zoo.link}>{this.props.zoo.link}</a></td>
        </tr>
    }
}

class ZooListTable extends React.Component<ZooTableProps, {}> {

    render() {
        return <table>
            <thead>
                <tr><th>Name</th><th>Postcode</th><th>Lat.</th><th>Long.</th><th>Link</th></tr>
            </thead>
            <tbody>
                {this.props.zooList.map((zoo) => <ZooTableRow zoo={zoo} />)}
            </tbody>
            <ZooFormRow onNewZoo={this.props.onNewZoo}/>
        </table>
    }
}

class ZooListPage extends React.Component<{}, ZooListPageState> {
    constructor(props: {}) {
        super(props);
        this.state = {isLoading: true, zooList: []};
        this.onNewZoo = this.onNewZoo.bind(this);
    }

    async componentDidMount(): Promise<void> {
        const zooList: ZooJson[] = await promiseGet("zoos/");
        this.setState({isLoading: false, zooList: zooList});
    }

    async onNewZoo(newZoo: NewZooJson) {
        const authHeaders = new Map([["authorization", getAuthCookie()]]);
        console.log(newZoo);
        const newZooData = await promisePost("zoos/", newZoo, authHeaders);
        this.setState((state) => { return {zooList: state.zooList.concat([newZooData])}});
    }

    render() {
        return <>
                <h1>List of UK zoos</h1>
                <a href="index.html">Back to admin index</a><br />
                <LoginStatus />
                <ZooListTable zooList={this.state.zooList} onNewZoo={this.onNewZoo} />
            </>
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    ReactDOM.render(<ZooListPage />, document.getElementById('zoo-list-page'));
});
