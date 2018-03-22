import * as React from "react";
import { Tooltip, Classes, Overlay, Position } from "@blueprintjs/core";
import { StateController } from "../state";
import { observer } from "mobx-react";
import { Filter } from "./filter";
import { sortStrings } from "../utils";
import { toolboxDivStyle, importsFromDiv, exportsToDiv } from "./style";
import { VersionTable, supportBox } from "./version_table";
import { ButtonStack, Justification } from "./stack";
import { Status, ToolSummary, ColumnReport } from "@modelica/fmi-data";
import * as ReactMarkdown from "react-markdown";
import { Columns } from "./columns";

export interface ZoomViewProps {
    controller: StateController;
    tools: string[];
}

const backgrounDivStyle: React.CSSProperties = {
    backgroundColor: "white",
};

const rowDivStyle: React.CSSProperties = {
    paddingTop: 20,
    paddingBottom: 10,
    display: "flex",
    flexDirection: "column",
};

const sortByColumn = (a: ColumnReport, b: ColumnReport) => {
    return sortStrings(a.name, b.name);
};

@observer
export class ZoomView extends React.Component<ZoomViewProps, {}> {
    render() {
        let selected = this.props.controller.selection;
        let open = !!selected;
        let importsFrom = this.props.controller.importsFromSelected
            ? this.props.controller.importsFromSelected.columns
            : [];
        let exportsTo = this.props.controller.exportsToSelected ? this.props.controller.exportsToSelected.columns : [];

        importsFrom.sort(sortByColumn);
        exportsTo.sort(sortByColumn);

        let importReport = (id: string) => {
            if (this.props.controller.importsFromSelected) {
                return this.props.controller.importsFromSelected.columns.find(x => x.id === id);
            }
            return null;
        };

        let exportReport = (id: string) => {
            if (this.props.controller.exportsToSelected) {
                return this.props.controller.exportsToSelected.columns.find(x => x.id === id);
            }
            return null;
        };

        let importLabel = (id: string): JSX.Element | null => {
            let imp = importReport(id);
            if (!imp) return null;
            return (
                <Tooltip position={Position.LEFT} key={imp.id} content={<VersionTable report={imp} />}>
                    <div style={toolboxDivStyle(imp.summary)}>
                        {supportBox(imp.summary, imp.name, {}, () => this.props.controller.setSelection(id))}
                    </div>
                </Tooltip>
            );
        };

        let exportLabel = (id: string): JSX.Element | null => {
            let exp = exportReport(id);
            if (!exp) return null;
            return (
                <Tooltip position={Position.RIGHT} key={exp.id} content={<VersionTable report={exp} />}>
                    <div style={toolboxDivStyle(exp.summary)}>
                        {supportBox(exp.summary, exp.name, {}, () => this.props.controller.setSelection(id))}
                    </div>
                </Tooltip>
            );
        };

        let toolName = "";
        let vendorName = "";
        let vendorURL: string | null = null;
        let desc = "";
        let email: JSX.Element | null = null;
        let summary: ToolSummary | null = null;
        if (this.props.controller.selection) {
            summary =
                this.props.controller.results.get().tools.find(t => t.id === this.props.controller.selection) || null;
            if (summary) {
                toolName = summary.displayName;
                vendorName = summary.vendor.displayName;
                vendorURL = summary.vendor.href;
                desc = summary.note;
                if (summary.email) {
                    email = (
                        <a href={"mailto:" + summary.email} style={{ flexGrow: 1 }}>
                            <span className="pt-icon-standard pt-icon-envelope" style={{ verticalAlign: "middle" }} />
                        </a>
                    );
                }
            }
        }

        return (
            <Overlay
                className={Classes.OVERLAY_SCROLL_CONTAINER}
                isOpen={open}
                onClose={() => this.props.controller.setSelection(null)}
                lazy={true}
                transitionDuration={1}
            >
                <div style={{ width: "80%", left: "10%", right: "10%", marginTop: "10vh" }}>
                    <div style={backgrounDivStyle}>
                        <div style={rowDivStyle}>
                            {summary && summary.homepage ? (
                                <h1 style={{ textAlign: "center" }}>
                                    <a href={summary.homepage}>{toolName}</a> {email}
                                </h1>
                            ) : (
                                <h1 style={{ textAlign: "center" }}>
                                    {toolName} {email}
                                </h1>
                            )}
                            {vendorURL ? (
                                <h3 style={{ textAlign: "center", marginTop: "10px" }}>
                                    by <a href={vendorURL}>{vendorName}</a>
                                </h3>
                            ) : (
                                <h3 style={{ textAlign: "center" }}>by {vendorName}</h3>
                            )}
                            <p style={{ textAlign: "center" }}>
                                <ReactMarkdown source={desc} />
                            </p>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Filter settings={this.props.controller} />
                            </div>
                            <Columns>
                                <div style={exportsToDiv}>
                                    <h4>{toolName} FMUs have been imported by:</h4>
                                    <div>
                                        {exportsTo.length === 0 &&
                                            summary && (
                                                <div>
                                                    <p>No tools</p>
                                                    <SupportTable
                                                        style={{ marginLeft: "auto" }}
                                                        summary={summary}
                                                        type="import"
                                                    />
                                                </div>
                                            )}
                                        <ButtonStack
                                            ids={exportsTo.map(exp => exp.id)}
                                            controller={this.props.controller}
                                            buttonStyle={id => ({})}
                                            intent="none"
                                            justification={Justification.RaggedLeft}
                                            renderLabel={exportLabel}
                                        />
                                    </div>
                                </div>
                                <div style={importsFromDiv}>
                                    <h4>{toolName} imports FMUs from:</h4>
                                    <div>
                                        {importsFrom.length === 0 &&
                                            summary && (
                                                <div>
                                                    <p>No tools</p>
                                                    <SupportTable
                                                        style={{ marginRight: "auto" }}
                                                        summary={summary}
                                                        type="export"
                                                    />
                                                </div>
                                            )}
                                        <ButtonStack
                                            ids={importsFrom.map(imp => imp.id)}
                                            controller={this.props.controller}
                                            buttonStyle={id => ({})}
                                            intent="none"
                                            justification={Justification.RaggedRight}
                                            renderLabel={importLabel}
                                        />
                                    </div>
                                </div>
                            </Columns>
                        </div>
                    </div>
                    )
                </div>
            </Overlay>
        );
    }
}

export interface SupportProps {
    summary: ToolSummary;
    type: "import" | "export";
    style?: React.CSSProperties;
}

class SupportTable extends React.Component<SupportProps, {}> {
    render() {
        let summary = this.props.summary;
        let type = this.props.type;
        return (
            <div style={{ marginTop: "20px" }}>
                <h6>Support claimed by vendor:</h6>
                <table className="pt-table pt-bordered" style={{ ...this.props.style }}>
                    <thead>
                        <tr>
                            <th>Version</th>
                            <th>{type === "export" ? "Import" : "Export"}</th>
                            <th>{type === "export" ? "Master" : "Slave"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>FMI 1.0</td>
                            {supportSpan(type === "export" ? summary.fmi1.import : summary.fmi1.export)}
                            {supportSpan(type === "export" ? summary.fmi1.master : summary.fmi1.slave)}
                        </tr>
                        <tr>
                            <td>FMI 2.0</td>
                            {supportSpan(type === "export" ? summary.fmi2.import : summary.fmi2.export)}
                            {supportSpan(type === "export" ? summary.fmi2.master : summary.fmi2.slave)}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

function supportSpan(status: Status): JSX.Element {
    switch (status) {
        case Status.Available:
            return (
                <td>
                    <span className={"pt-tag pt-intent-warning"} style={{ width: "100%", textAlign: "center" }}>
                        Available
                    </span>
                </td>
            );
        case Status.Planned:
            return (
                <td>
                    <span className={"pt-tag pt-intent-default"} style={{ width: "100%", textAlign: "center" }}>
                        Planned
                    </span>
                </td>
            );
        default:
            return <td>&nbsp;</td>;
    }
}
