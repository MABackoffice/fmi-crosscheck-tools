import * as React from "react";
import { fmiVersions, fmiVariants, fmiPlatforms } from "../options";
import { Selection } from "./selection";
import { observer } from "mobx-react";
import { FilterController } from "../state";

export interface FilterSettings {
    settings: FilterController;
}

@observer
export class Filter extends React.Component<FilterSettings, {}> {
    render() {
        let settings = this.props.settings;
        return (
            <div style={{ display: "flex" }}>
                <Selection
                    label="FMI Version"
                    onChange={v => settings.setVersion(v || null)}
                    currentKey={settings.version || undefined}
                    options={fmiVersions}
                />
                <Selection
                    label="Variant"
                    onChange={v => settings.setVariant(v || null)}
                    currentKey={settings.variant || undefined}
                    options={fmiVariants}
                />
                <Selection
                    label="Platform"
                    onChange={v => settings.setPlatform(v || null)}
                    currentKey={settings.platform || undefined}
                    options={fmiPlatforms}
                />
            </div>
        );
    }
}
