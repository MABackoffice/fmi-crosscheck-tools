import * as React from "react";
import { StateController, ComputedProperties } from "../state";
import { observer } from "mobx-react";
import { Collapse } from "@blueprintjs/core";

export interface UncheckedProps {
    imports: boolean;
    controller: StateController;
    computed: ComputedProperties;
}

function describe(level: string, intent: string, list: string[], select: (id: string) => void): JSX.Element {
    return (
        <div style={{ bottom: 0, textAlign: "left", marginBottom: "10px" }}>
            <h5>{level}</h5>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
                {list.length === 0 && <span>None</span>}
                {list.map((id, i) => (
                    <a key={i} onClick={() => select(id)} style={{ flexGrow: 1, margin: 2 }}>
                        <span className={"pt-tag pt-intent-" + intent} style={{ width: "100%", textAlign: "center" }}>
                            {id}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}

@observer
export class Unchecked extends React.Component<UncheckedProps, {}> {
    render() {
        let support = this.props.imports
            ? this.props.computed.uncheckedImporting
            : this.props.computed.uncheckedExporting;
        let select = (id: string) => {
            this.props.controller.setSelection(id);
        };
        let isOpen =
            (this.props.controller.unchecked || !!this.props.controller.search) &&
            this.props.controller.platform === undefined;
        return (
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ flexGrow: 1, marginTop: "20px" }} />
                <Collapse isOpen={isOpen}>
                    {describe(
                        "Available",
                        "warning",
                        support.available.filter(this.props.computed.matchesTerm),
                        select,
                    )}
                    {describe(
                        "Planning Support",
                        "default",
                        support.planned.filter(this.props.computed.matchesTerm),
                        select,
                    )}
                </Collapse>
            </div>
        );
    }
}
