import * as React from "react";
import { observer } from "mobx-react";

export interface SearchSettings {
    settings: {
        search: string;
        showUnchecked: boolean;
    };
}

@observer
export class Search extends React.Component<SearchSettings, {}> {
    render() {
        let settings = this.props.settings;
        let updateSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
            let term = ev.target.value;
            settings.search = term || "";
        };
        return (
            <div style={{ display: "flex" }}>
                <label
                    className="pt-control pt-checkbox pt-inline"
                    style={{
                        marginLeft: "20px",
                        marginTop: "auto",
                        marginBottom: "auto",
                        paddingBottom: "15px",
                    }}
                >
                    <input
                        type="checkbox"
                        value={settings.showUnchecked ? "true" : "false"}
                        onChange={() => (settings.showUnchecked = !settings.showUnchecked)}
                    />
                    <span className="pt-control-indicator" />
                    Show Planned and Available Support
                </label>
                <div className="pt-input-group">
                    <span className="pt-icon pt-icon-search" />
                    <input
                        className="pt-input"
                        type="search"
                        placeholder="Search input"
                        value={settings.search}
                        onChange={updateSearch}
                        dir="auto"
                    />
                </div>
            </div>
        );
    }
}
