import * as React from "react";
import "./support_matrix.css";
import { observer } from "mobx-react";
import { QueryFunction } from "../data";
import { FMISpinner } from "./spinner";
import { Filter } from "./filter";
import { Search } from "./search";
import { StateController, MemoryState } from "../state";
import { ButtonStack, Justification } from "./stack";
import { ZoomView } from "./zoom";
import { truncate, sortStrings } from "../utils";
import { Columns } from "./columns";
import { Unchecked } from "./unchecked";
import { Colors } from "@blueprintjs/core";

const colDivStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
};

const stackStyle: React.CSSProperties = {
    flexGrow: 0,
};

export interface SupportMatrixProps {
    query: QueryFunction;
}

@observer
export class SupportMatrixViewer extends React.Component<SupportMatrixProps, {}> {
    private controller: StateController;

    constructor(props: SupportMatrixProps, context: {}) {
        super(props, context);
        // TODO: Use new React 16.3 Context API to create a provider/consumer pair...
        this.controller = new MemoryState(props.query);
    }

    render() {
        let importStyle = (id: string) => ({ backgroundColor: Colors.FOREST5 });
        let exportStyle = (id: string) => ({ backgroundColor: Colors.FOREST5 });
        let getLabel = (id: string): string => {
            let tool = this.controller.results.get().tools.find(summary => summary.id === id);
            if (!tool) return "Unknown Tool: " + id; // Should not happen
            return truncate(tool.displayName);
        };
        let renderLabel = (id: string) => {
            return <span>{getLabel(id)}</span>;
        };
        let sortByLabel = (aid: string, bid: string) => {
            let alabel = getLabel(aid).toLowerCase();
            let blabel = getLabel(bid).toLowerCase();
            return sortStrings(alabel, blabel);
        };

        let columns = this.controller.columns;
        let exportOnly = columns.export_only.filter(this.controller.matchesTerm);
        exportOnly.sort(sortByLabel);
        let both = columns.both.filter(this.controller.matchesTerm);
        both.sort(sortByLabel);
        let importOnly = columns.import_only.filter(this.controller.matchesTerm);
        importOnly.sort(sortByLabel);

        return (
            <div className="Support" style={{ margin: "10px" }}>
                <div style={{ display: "flex" }}>
                    <Filter settings={this.controller} />
                    <Search settings={this.controller} />
                </div>
                {/* Show spinner if the data hasn't loaded yet */}
                {this.controller.loading && FMISpinner}
                {!this.controller.loading && (
                    <div>
                        <p>Select a tool to find out more about its FMI capabilities...</p>
                        <div style={{ display: "flex", marginBottom: "30px" }}>
                            <Columns style={{ flexGrow: 1 }}>
                                <div style={colDivStyle}>
                                    <h4>
                                        Export only&nbsp;<span className="pt-icon-arrow-right" />
                                    </h4>
                                    <h5 style={{ textAlign: "left" }}>Cross-Checked</h5>
                                    {exportOnly.length === 0 ? (
                                        <p>No tools match filter parameters</p>
                                    ) : (
                                        <ButtonStack
                                            ids={exportOnly}
                                            style={stackStyle}
                                            controller={this.controller}
                                            buttonStyle={exportStyle}
                                            renderLabel={renderLabel}
                                            justification={Justification.Block}
                                        />
                                    )}
                                    <Unchecked imports={false} controller={this.controller} />
                                </div>
                                <div style={colDivStyle}>
                                    <h4>
                                        <span className="pt-icon-arrow-right" />&nbsp;Import and Export&nbsp;<span className="pt-icon-arrow-right" />
                                    </h4>
                                    <h5 style={{ textAlign: "left" }}>Cross-Checked</h5>
                                    {both.length === 0 ? (
                                        <p>No tools match filter parameters</p>
                                    ) : (
                                        <ButtonStack
                                            ids={both}
                                            style={stackStyle}
                                            controller={this.controller}
                                            buttonStyle={importStyle}
                                            renderLabel={renderLabel}
                                            justification={Justification.Block}
                                        />
                                    )}
                                </div>
                                <div style={colDivStyle}>
                                    <h4>
                                        <span className="pt-icon-arrow-right" />&nbsp;Import only
                                    </h4>
                                    <h5 style={{ textAlign: "left" }}>Cross-Checked</h5>
                                    {importOnly.length === 0 ? (
                                        <p>No tools match filter parameters</p>
                                    ) : (
                                        <ButtonStack
                                            ids={importOnly}
                                            style={stackStyle}
                                            controller={this.controller}
                                            buttonStyle={importStyle}
                                            renderLabel={renderLabel}
                                            justification={Justification.Block}
                                        />
                                    )}
                                    <Unchecked imports={true} controller={this.controller} />
                                </div>
                            </Columns>
                        </div>
                        <ZoomView controller={this.controller} tools={columns.tools} />
                        {/* <SupportGraph matrix={this.matrix.get()} /> */}
                    </div>
                )}
            </div>
        );
    }
}
