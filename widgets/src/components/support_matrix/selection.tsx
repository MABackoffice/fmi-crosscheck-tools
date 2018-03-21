import * as React from "react";
import { observer } from "mobx-react";

export interface SelectionDetails {
    label: string;
    currentKey: string | undefined;
    onChange: (value: string | undefined) => void;
    options: Array<{ key: string; label: string }>;
}

@observer
export class Selection extends React.Component<SelectionDetails, {}> {
    constructor(props: SelectionDetails, context?: {}) {
        super(props, context);
    }
    render() {
        let props = this.props;
        return (
            <label className="pt-label pt-inline" style={{ marginLeft: "20px" }}>
                {this.props.label}
                <div className="pt-select">
                    <select
                        value={this.props.currentKey}
                        onChange={event =>
                            props.onChange(event.target.value === "" ? "" : (event.target.value as string))
                        }
                    >
                        {props.options.map((entry, i) => (
                            <option key={i} value={entry.key}>
                                {entry.label}
                            </option>
                        ))}
                    </select>
                </div>
            </label>
        );
    }
}
