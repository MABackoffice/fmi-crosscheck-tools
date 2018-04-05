import * as React from "react";
import "./support_matrix.css";
import { observer } from "mobx-react";
import { QueryFunction } from "../data";
import { FMISpinner } from "./spinner";
import { Filter } from "./filter";
import { Search } from "./search";
import { StateController, RouterState, ComputedProperties } from "../state";
import { ButtonStack, Justification } from "./stack";
import { ZoomView } from "./zoom";
import { truncate, sortStrings } from "../utils";
import { Columns } from "./columns";
import { Unchecked } from "./unchecked";
import { Colors } from "@blueprintjs/core";
import { SupportMatrixProps } from "./support_matrix";

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
export class TwoColumnView extends React.Component<SupportMatrixProps, {}> {
    private controller: StateController;
    private computed: ComputedProperties;

    constructor(props: SupportMatrixProps, context: {}) {
        super(props, context);
        // TODO: Use new React 16.3 Context API to create a provider/consumer pair...
        this.controller = new RouterState();
        this.computed = new ComputedProperties(this.controller, props.query);
    }

    render() {
        let importStyle = (id: string) => ({ backgroundColor: Colors.FOREST5 });
        let exportStyle = (id: string) => ({ backgroundColor: Colors.FOREST5 });
        let getLabel = (id: string): string => {
            let tool = this.computed.results.get().tools.find(summary => summary.id === id);
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

        let columns = this.computed.columns;
        let both = columns.both.filter(this.computed.matchesTerm);
        let exportSupport = [...columns.export_only.filter(this.computed.matchesTerm), ...both];
        exportSupport.sort(sortByLabel);
        let importSupport = [...columns.import_only.filter(this.computed.matchesTerm), ...both];
        importSupport.sort(sortByLabel);

        return (
            <div className="Support" style={{ margin: "10px" }}>
                <div style={{ display: "flex" }}>
                    <Filter settings={this.controller} />
                    <Search settings={this.controller} />
                </div>
                {/* Show spinner if the data hasn't loaded yet */}
                {this.computed.loading && FMISpinner}
                {!this.computed.loading && (
                    <div>
                        <p>Select a tool to find out more about its FMI capabilities...</p>
                        <div style={{ display: "flex", marginBottom: "30px" }}>
                            <Columns style={{ flexGrow: 1 }}>
                                <div style={colDivStyle}>
                                    <h4>
                                        Support Export&nbsp;<span className="pt-icon-arrow-right" />
                                    </h4>
                                    <h5 style={{ textAlign: "left" }}>Cross-Checked</h5>
                                    {exportSupport.length === 0 ? (
                                        <p>No tools match filter parameters</p>
                                    ) : (
                                        <ButtonStack
                                            ids={exportSupport}
                                            style={stackStyle}
                                            controller={this.controller}
                                            buttonStyle={exportStyle}
                                            renderLabel={renderLabel}
                                            justification={Justification.Block}
                                        />
                                    )}
                                    <Unchecked imports={false} controller={this.controller} computed={this.computed} />
                                </div>
                                <div style={colDivStyle}>
                                    <h4>
                                        <span className="pt-icon-arrow-right" />&nbsp;Support Import
                                    </h4>
                                    <h5 style={{ textAlign: "left" }}>Cross-Checked</h5>
                                    {importSupport.length === 0 ? (
                                        <p>No tools match filter parameters</p>
                                    ) : (
                                        <ButtonStack
                                            ids={importSupport}
                                            style={stackStyle}
                                            controller={this.controller}
                                            buttonStyle={importStyle}
                                            renderLabel={renderLabel}
                                            justification={Justification.Block}
                                        />
                                    )}
                                    <Unchecked imports={true} controller={this.controller} computed={this.computed} />
                                </div>
                            </Columns>
                        </div>
                        <ZoomView controller={this.controller} tools={columns.tools} computed={this.computed} />
                    </div>
                )}
            </div>
        );
    }
}
