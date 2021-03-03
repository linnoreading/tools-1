import * as React from "react";
import { Component } from "react";
import "../scss/Championview.scss";
import Sidebar from "../components/Sidebar";
import {
  DatePicker,
  DayOfWeek,
  IDatePickerStrings,
} from "office-ui-fabric-react/lib/DatePicker";
import { mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import cx from "classnames";
import { DefaultButton } from "office-ui-fabric-react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Dropdown, IDropdown } from "office-ui-fabric-react/lib/Dropdown";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { sp } from "@pnp/sp";
import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
} from "@microsoft/sp-http";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Alert from "@material-ui/lab/Alert";
import { DataGrid } from "@material-ui/data-grid";
import * as moment from "moment";
import siteconfig from "../config/siteconfig.json";

const columns = [
  { field: "DateOfEvent", headerName: "Date of Event", width: 250 },
  { field: "type", headerName: "Type", width: 250 },
  { field: "count", headerName: "Points", width: 250 },
];
const DayPickerStrings: IDatePickerStrings = {
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  shortMonths: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  days: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],

  shortDays: ["S", "M", "T", "W", "T", "F", "S"],

  goToToday: "Go to today",
  prevMonthAriaLabel: "Go to previous month",
  nextMonthAriaLabel: "Go to next month",
  prevYearAriaLabel: "Go to previous year",
  nextYearAriaLabel: "Go to next year",
  closeButtonAriaLabel: "Close date picker",
};

const controlClass = mergeStyleSets({
  control: {
    margin: "0 0 15px 0",
    maxWidth: "300px",
  },
});

const firstDayOfWeek = DayOfWeek.Sunday;
export interface ChampionViewProps {
  context: WebPartContext;
  onClickCancel: () => void;
  showSidebar?: boolean;
  callBack?: Function;
}
export interface lookUp {
  value: string;
  display: string;
}
export interface ChampionViewState {
  siteUrl: string;
  type: string;
  teams: Array<lookUp>;
  selectedTeam: string;
  validationError: string;
  eventid: number;
  memberid: number;
  count: number;
  DateOfEvent: Date;
  collection: Array<ChampList>;
  collectionNew: Array<ChampList>;
  edetails: Array<string>;
  eFlag: boolean;
  optionvalues: Array<string>;
  selectedkey: number;
  isShow: boolean;
  cb: boolean;
  Clb: boolean;
  newMemberId: number;
  sitename: string;
  inclusionpath: string;
  loading: boolean;
}
export interface ChampList {
  id: number;
  type: string;
  eventid: number;
  memberid: number;
  count: number;
  DateOfEvent: Date;
}
export default class ChampionvView extends Component<
  ChampionViewProps,
  ChampionViewState
> {
  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context,
    });
    this.getListData123 = this.getListData123.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getListData = this.getListData.bind(this);
    this.setCount = this.setCount.bind(this);
    this.createorupdateItem = this.createorupdateItem.bind(this);
    this.options = this.options.bind(this);
    this.removeDevice = this.removeDevice.bind(this);
    this.getMemberId = this.getMemberId.bind(this);
    this.state = {
      siteUrl: this.props.context.pageContext.web.absoluteUrl.replace(
        this.props.context.pageContext.web.serverRelativeUrl,
        ""
      ),
      type: "",
      teams: [],
      selectedTeam: "",
      validationError: "",
      eventid: 0,
      memberid: 0,
      count: 1,
      DateOfEvent: new Date(),
      collection: [],
      collectionNew: [],
      edetails: [],
      eFlag: false,
      optionvalues: [],
      selectedkey: 0,
      isShow: false,
      cb: false,
      Clb: false,
      newMemberId: 0,
      sitename: siteconfig.sitename,
      inclusionpath: siteconfig.inclusionPath,
      loading: true,
    };
  }

  public onChange(d: any) {
    this.setState({ DateOfEvent: d });
  }

  public addDevice(data: ChampList, saved: any) {
    if (saved === "false") {
      this.setState({ collectionNew: [] });
      const newBag = this.state.collectionNew.concat(data);
      this.setState({
        collectionNew: newBag,
        eventid: 0,
        count: 1,
      });
      this.setState({ selectedkey: 0 });
    } else {
      const newBag = this.state.collection.concat(data);
      this.setState({
        collection: newBag,
      });
    }
  }
  public options() {
    let optionArray = [];

    if (this.state.edetails.length == 0)
      this.props.context.spHttpClient
        .get(
          this.state.siteUrl +
            "/" +
            this.state.inclusionpath +
            "/" +
            this.state.sitename +
            "/_api/web/lists/GetByTitle('Events List')/Items",
          SPHttpClient.configurations.v1
        )
        .then(async (response: SPHttpClientResponse) => {
          if (response.status === 200) {
            await response.json().then((responseJSON: any) => {
              let i = 0;
              while (i < responseJSON.value.length) {
                if (
                  responseJSON.value[i] &&
                  responseJSON.value[i].hasOwnProperty("Title")
                ) {
                  optionArray.push(responseJSON.value[i].Title);
                  i++;
                }
              }
              this.setState({ edetails: optionArray });
            });
          }
        })
        .catch(() => {
          throw new Error("Asynchronous error");
        });

    let myOptions = [];
    myOptions.push({ key: "Select Event Type", text: "Select Event Type" });
    this.state.edetails.forEach((element: any) => {
      myOptions.push({ key: element, text: element });
    });
    return myOptions;
  }

  public removeDevice(type: string, count: number) {
    this.setState((prevState) => ({
      collectionNew: prevState.collectionNew.filter(
        (d) => d.type !== type,
        count
      ),
    }));
  }

  public createorupdateItem() {
    this.setState({ isShow: true });
    for (let link of this.state.collectionNew) {
      let seventid = String(link.eventid);
      let smemberid = String(link.memberid);
      let sdoe = link.DateOfEvent;
      let stype = link.type;
      let scount = link.count * 10;
      if (true) {
        const listDefinition: any = {
          Title: stype,
          EventId: seventid,
          MemberId: smemberid,
          DateofEvent: sdoe,
          Count: scount,
        };

        const spHttpClientOptions: ISPHttpClientOptions = {
          body: JSON.stringify(listDefinition),
        };

        if (true) {
          setTimeout(() => {
            this.setState({ isShow: false });
          }, 2000);

          this.props.callBack();

          const url: string =
            "/" +
            this.state.inclusionpath +
            "/" +
            this.state.sitename +
            "/_api/web/lists/GetByTitle('Event Track Details')/items";
          if (this.props.context)
            this.props.context.spHttpClient
              .post(
                this.state.siteUrl + url,
                SPHttpClient.configurations.v1,
                spHttpClientOptions
              )
              .then((responseData: SPHttpClientResponse) => {
                this.addDevice(link, "true");
                if (responseData.status === 201) {
                  this.getListData(smemberid, seventid);
                } else {
                  alert(
                    "Response status " +
                      responseData.status +
                      " - " +
                      responseData.statusText
                  );
                }
              })
              .catch((error) => alert(error.message));
        } else {
        }
        this.setState((prevState) => ({
          collectionNew: prevState.collectionNew.filter(
            (d) => d.type === "xxx"
          ),
        }));
      }
    }
    this.setState((prevState) => ({
      collectionNew: prevState.collectionNew.filter((d) => d.eventid != 99191),
    }));
    this.setState({ cb: true });
  }

  private getListData123(memberid: any, eventid: any): boolean {
    let flag = false;
    this.props.context.spHttpClient
      .get(
        this.state.siteUrl +
          "/" +
          this.state.inclusionpath +
          "/" +
          this.state.sitename +
          "/_api/web/lists/GetByTitle('Event Track Details')/Items",
        SPHttpClient.configurations.v1
      )
      .then(async (response: SPHttpClientResponse) => {
        if (response.status === 200) {
          await response.json().then((responseJSON: any) => {
            let i = 0;
            while (i < responseJSON.value.length) {
              if (responseJSON.value[i].MemberId == memberid) {
                if (responseJSON.value[i].EventId == eventid) return flag;
              }
              i++;
            }
          });
        }
      });
    return flag;
  }

  private async getListData(memberid: any, eventid: any): Promise<any> {
    this.setState({ collection: [] });
    const response = await this.props.context.spHttpClient.get(
      this.state.siteUrl +
        "/" +
        this.state.inclusionpath +
        "/" +
        this.state.sitename +
        "/_api/web/lists/GetByTitle('Event Track Details')/Items",
      SPHttpClient.configurations.v1
    );
    if (response.status === 200) {
      await response.json().then((responseJSON: any) => {
        let i = 0;
        while (i < responseJSON.value.length) {
          if (responseJSON.value[i].MemberId == memberid) {
            if (responseJSON.value[i].MemberId == memberid)
              this.setState((prevState) => ({
                collection: prevState.collection.filter(
                  (d) => d.memberid == memberid
                ),
              }));
            let c = {
              id: i,
              type: responseJSON.value[i].Title,
              eventid: responseJSON.value[i].EventId,
              memberid: memberid,
              count: responseJSON.value[i].Count,
              DateOfEvent: responseJSON.value[i].DateofEvent,
            };
            const newBag = this.state.collection.concat(c);
            this.setState({
              collection: newBag,
              eventid: 0,
            });
          }
          i++;
        }
      });
    }
  }

  public renderFormateDate(collection: any) {
    const formateDateCollection = collection.map((item: any) => {
      return {
        ...item,
        DateOfEvent: moment(item.DateOfEvent).format("MMMM Do YYYY, h:mm:ss a"),
      };
    });
    return formateDateCollection;
  }

  public getMemberId(): number {
    this.props.context.spHttpClient
      .get(
        this.state.siteUrl +
          "/_api/SP.UserProfiles.PeopleManager/GetMyProperties",
        SPHttpClient.configurations.v1
      )
      .then((responseuser: SPHttpClientResponse) => {
        responseuser.json().then((datauser: any) => {
          if (!datauser.error) {
            this.props.context.spHttpClient
              .get(
                this.state.siteUrl +
                  "/_api/web/lists/GetByTitle('Member List')/Items",
                SPHttpClient.configurations.v1
              )
              .then((response: SPHttpClientResponse) => {
                response.json().then((datada) => {
                  let memberDataIds = datada.value.find(
                    (d: { Title: string }) =>
                      d.Title.toLowerCase() === datauser.Email.toLowerCase()
                  ).ID;
                  this.setState({ newMemberId: memberDataIds });
                  this.setState({ collection: [] });
                  this.props.context.spHttpClient
                    .get(
                      this.state.siteUrl +
                        "/" +
                        this.state.inclusionpath +
                        "/" +
                        this.state.sitename +
                        "/_api/web/lists/GetByTitle('Event Track Details')/Items",
                      SPHttpClient.configurations.v1
                    )
                    .then((response1: SPHttpClientResponse) => {
                      response1.json().then((responseJSON: any) => {
                        let i = 0;
                        let memberid = localStorage["memberid"];
                        if (
                          memberid === null ||
                          memberid === "undefined" ||
                          memberid === "undefine"
                        ) {
                          memberid = memberDataIds;
                        }
                        while (i < responseJSON.value.length) {
                          if (responseJSON.value[i].MemberId == memberid) {
                            if (responseJSON.value[i].MemberId == memberid)
                              this.setState((prevState) => ({
                                collection: prevState.collection.filter(
                                  (d) => d.memberid == memberid
                                ),
                              }));
                            let c = {
                              id: i,
                              type: responseJSON.value[i].Title,
                              eventid: responseJSON.value[i].EventId,
                              memberid: memberid,
                              count: responseJSON.value[i].Count,
                              DateOfEvent: responseJSON.value[i].DateofEvent,
                            };
                            const newBag = this.state.collection.concat(c);
                            this.setState({
                              collection: newBag,
                              eventid: 0,
                            });
                          }
                          i++;
                        }
                      });
                    });
                  return memberDataIds;
                });
              });
          }
        });
      });
    return 0;
  }
  public async componentDidMount() {
    setTimeout(() => {
      let memid: number = 0;
      memid = this.getMemberId();
      this.setState({ loading: false });
    }, 3000);
  }

  public handleSelect = (evt: any) => {
    let ca: string = evt.target.outerText;
    switch (true) {
      case ca.indexOf("Event Moderator") >= 0:
        this.setState({
          selectedkey: 1,
          type: "Event Moderator",
          eventid: 1,
          memberid: localStorage["memberid"],
        });
        break;

      case ca.indexOf("Office Hours") >= 0:
        this.setState({
          selectedkey: 2,
          type: "Office Hours",
          eventid: 2,
          memberid: localStorage["memberid"],
        });
        break;

      case ca.indexOf("Blog") >= 0:
        this.setState({
          selectedkey: 3,
          type: "Blog",
          eventid: 3,
          memberid: localStorage["memberid"],
        });
        break;

      case ca.indexOf("Training") >= 0:
        this.setState({
          selectedkey: 4,
          type: "Training",
          eventid: 4,
          memberid: localStorage["memberid"],
        });
        break;

      default:
        this.setState({
          selectedkey: 0,
          type: ca,
          eventid: 0,
          memberid: localStorage["memberid"],
        });
        break;
    }
  }

  private setCount(e: any): void {
    this.setState({ count: e.target.value });
  }

  public render() {
    const onRenderCaretDown = (): JSX.Element => {
      return <span></span>;
    };

    return (
      <form>
        <div className="Championview d-flex ">
          {this.state.isShow && <div className="loader"></div>}
          {!this.state.isShow && this.props.showSidebar && (
            <Sidebar
              context={this.props.context}
              becomec={false}
              onClickCancel={() => this.props.onClickCancel()}
              callBack={this.createorupdateItem}
            />
          )}
          <div className="main">
            {this.props.showSidebar && <div className="cv">Championview</div>}
            {!this.state.isShow && (
              <Accordion>
                <Card>
                  <Accordion.Toggle
                    as={Card.Header}
                    eventKey="0"
                    className="cursor cvw"
                  >
                    View Dashboard
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body className="cb">
                      <div
                        className="ag-theme-alpine"
                        style={{
                          height: 400,
                          width: "auto",
                          backgroundColor: "rgba(158,187,208,.5)",
                        }}
                      >
                        <DataGrid
                          rows={this.renderFormateDate(this.state.collection)}
                          columns={columns}
                          pageSize={10}
                          loading={this.state.loading}
                        />
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Accordion.Toggle
                    as={Card.Header}
                    eventKey="1"
                    className="cursor"
                  >
                    Record Event
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="1">
                    <Card.Body className="cb">
                      <div className="form-fields">
                        <div className="form-data">
                          <div className="form-group row">
                            <label
                              htmlFor="date"
                              className="col-sm-3 col-form-label"
                            >
                              Month and Date
                            </label>
                            <DatePicker
                              className={cx(
                                controlClass.control,
                                "col-sm-9",
                                "date"
                              )}
                              firstDayOfWeek={firstDayOfWeek}
                              strings={DayPickerStrings}
                              showWeekNumbers={true}
                              firstWeekOfYear={1}
                              showMonthPickerAsOverlay={true}
                              placeholder="Select a date..."
                              ariaLabel="Select a date"
                              onSelectDate={this.onChange}
                              value={this.state.DateOfEvent}
                            />
                          </div>
                          <div className="form-group row">
                            <label
                              htmlFor="type"
                              className="col-sm-3 col-form-label"
                            >
                              Types
                            </label>
                            <div className="col-sm-9">
                              <Dropdown
                                placeholder="Select Event Type"
                                onChange={(evt) => this.handleSelect(evt)}
                                id="drp"
                                options={this.options()}
                                onRenderCaretDown={onRenderCaretDown}
                              />
                            </div>
                          </div>
                          {this.state.type &&
                          this.state.type !== "Select Event Type" ? (
                            <div className="form-group row">
                              <label
                                htmlFor="inputCount"
                                className="col-sm-3 col-form-label"
                              >
                                Count
                              </label>
                              <div className="col-sm-9">
                                <TextField
                                  value={this.state.count.toString()}
                                  onChange={this.setCount}
                                  id="inputCount"
                                  type="number"
                                  min="1"
                                  max="5"
                                />
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                          <div className="row">
                            <div className="col-12">
                              <div className="float-end">
                                <DefaultButton
                                  text="Add"
                                  onClick={(e) =>
                                    this.addDevice(
                                      {
                                        id: 0,
                                        type: this.state.type,
                                        eventid: this.state.eventid,
                                        memberid: this.state.memberid,
                                        count: this.state.count,
                                        DateOfEvent: this.state.DateOfEvent,
                                      },
                                      "false"
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          {this.state.collectionNew.map((item) => (
                            <div key={item.eventid} className="m-2 mb-3">
                              <div className="mb-3">
                                When you are done adding Events, Please Click on{" "}
                                <b>Submit</b> to save
                              </div>
                              <Alert
                                onClose={() => {
                                  this.removeDevice(item.type, item.count);
                                }}
                              >
                                {" "}
                                {item.type}{" "}
                                <span className="ml-4">{item.count}</span>{" "}
                              </Alert>
                              <DefaultButton
                                text="Submit"
                                className="mt-4 float-end"
                                onClick={this.createorupdateItem}
                              />
                            </div>
                          ))}
                          <br />
                        </div>
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            )}
          </div>
        </div>
      </form>
    );
  }
}
