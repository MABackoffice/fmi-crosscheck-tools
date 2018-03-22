import { observable, computed } from "mobx";
import { promisedComputed } from "computed-async-mobx";
import { MatrixReport, RowReport, Status, ToolSummary, FMIVersion, FMIVariant } from "@modelica/fmi-data";
import { QueryFunction, QueryResult } from "../data";
import { Columns, UncheckedSupport, ComputedProperties } from "./types";

const emptyMatrix: MatrixReport = { tools: [], exportsTo: [], importsFrom: [] };
const emptyResult: QueryResult = { formatVersion: "1", matrix: emptyMatrix, tools: [] };

/**
 * The BaseState class encapsulates the current status of the query subject
 * to filtering on FMI version, variant and platform.  It includes internal
 * variables to represent the currently selected tool, version, variant,
 * platform, search term and whether to display unchecked support.
 *
 * However, it is **not** an implementation of StateController (yet).  It
 * simply acts as a base class for such a controller.
 *
 * TODO: Write some tests to test the logic in these @computed properties
 */
export class BaseState implements ComputedProperties {
    /** Currently selected tool */
    @observable protected currentSelection: string | null = null;
    /** Version of FMI to filter on (if any) */
    @observable protected currentVersion: string | null = null;
    /** Variant of FMI to filter on (if any) */
    @observable protected currentVariant: string | null = null;
    /** Platform to filter on (if any) */
    @observable protected currentPlatform: string | null = null;
    /** Whether to show available and planned support */
    @observable protected showUnchecked = false;
    /** A search term */
    @observable protected searchTerm: string = "";

    /** These are the results of the query. */
    results = promisedComputed<QueryResult>(emptyResult, () => {
        return this.query(this.currentVersion, this.currentVariant, this.currentPlatform);
    });

    @computed
    get matrix() {
        return this.results.get().matrix;
    }

    /** A flag indicating whether we are waiting for the matrix report */
    @computed
    get loading() {
        return this.results.busy;
    }

    /**
     * Map of tool ids to tool names for tools that exported FMUs that were
     * subsequently imported (subject to filter settings)
     */
    @computed
    get export_tools(): { [id: string]: string } {
        let ret = {};
        this.matrix.importsFrom.forEach(exp => {
            ret[exp.id] = exp.name;
            exp.columns.forEach(imp => {
                ret[imp.id] = imp.name;
            });
        });
        return ret;
    }

    /**
     * Map of tool ids that improted FMUs (subject to filter settings)
     */
    @computed
    get import_tools(): { [id: string]: string } {
        let ret = {};
        this.matrix.importsFrom.forEach(exp => {
            ret[exp.id] = exp.name;
            exp.columns.forEach(imp => {
                ret[imp.id] = imp.name;
            });
        });
        return ret;
    }

    /** List of all tools that exported FMUs that were imported from the current tool */
    @computed
    get exportsToSelected(): RowReport | null {
        if (this.currentSelection == null) return null;

        for (let i = 0; i < this.matrix.exportsTo.length; i++) {
            if (this.matrix.exportsTo[i].id === this.currentSelection) return this.matrix.exportsTo[i];
        }
        // Happens if tool doesn't support export
        return null;
    }

    /** List of all tools that imported FMUs that were exported by the current tool */
    @computed
    get importsFromSelected(): RowReport | null {
        if (this.currentSelection == null) return null;

        for (let i = 0; i < this.matrix.importsFrom.length; i++) {
            if (this.matrix.importsFrom[i].id === this.currentSelection) return this.matrix.importsFrom[i];
        }
        // Happens if tool doesn't export
        return null;
    }

    @computed
    get incv1() {
        return this.currentVersion === FMIVersion.FMI1 || this.currentVersion === undefined;
    }

    @computed
    get incv2() {
        return this.currentVersion === FMIVersion.FMI2 || this.currentVersion === undefined;
    }

    @computed
    get inccs() {
        return this.currentVariant === FMIVariant.CS || this.currentVariant === undefined;
    }

    @computed
    get incme() {
        return this.currentVariant === FMIVariant.ME || this.currentVariant === undefined;
    }

    /**
     * This computes which tools belong in the three categories:
     *   * Export only
     *   * Import and Export (both)
     *   * Import only
     */
    @computed
    get columns(): Columns {
        // TODO: Shouldn't this be all tools?
        let ekeys = Object.keys(this.export_tools);
        let importOnly: string[] = [];
        let exportOnly: string[] = [];
        let both: string[] = [];

        ekeys.forEach(key => {
            let exports = this.matrix.exportsTo.some(exp => exp.id === key);
            let imports = this.matrix.exportsTo.some(exp => exp.columns.some(imp => imp.id === key));
            if (imports && exports) both.push(key);
            if (imports && !exports) importOnly.push(key);
            if (exports && !imports) exportOnly.push(key);
        });

        return {
            tools: ekeys,
            import_only: importOnly,
            export_only: exportOnly,
            both: both,
        };
    }

    @computed
    get uncheckedImporting(): UncheckedSupport {
        let isAvailable = (tool: ToolSummary) => this.isImporting(tool, Status.Available);
        let isPlanned = (tool: ToolSummary) => this.isImporting(tool, Status.Planned);
        let notCrossChecked = (id: string) =>
            this.columns.both.indexOf(id) === -1 && this.columns.import_only.indexOf(id) === -1;
        let available = this.results
            .get()
            .tools.filter(isAvailable)
            .map(tool => tool.id)
            .filter(notCrossChecked);
        let planned = this.results
            .get()
            .tools.filter(isPlanned)
            .map(tool => tool.id)
            .filter(notCrossChecked);
        return {
            available: available,
            planned: planned,
        };
    }

    @computed
    get uncheckedExporting(): UncheckedSupport {
        let isAvailable = (tool: ToolSummary) => this.isExporting(tool, Status.Available);
        let isPlanned = (tool: ToolSummary) => this.isExporting(tool, Status.Planned);
        let notCrossChecked = (id: string) =>
            this.columns.both.indexOf(id) === -1 && this.columns.export_only.indexOf(id) === -1;
        let available = this.results
            .get()
            .tools.filter(isAvailable)
            .map(tool => tool.id)
            .filter(notCrossChecked);
        let planned = this.results
            .get()
            .tools.filter(isPlanned)
            .map(tool => tool.id)
            .filter(notCrossChecked);
        return {
            available: available,
            planned: planned,
        };
    }

    public matchesTerm = (id: string) => {
        /* If the search term is an empty string, it matches everything */
        if (this.searchTerm === "") return true;

        /* Get ToolSummary */
        let summary = this.results.get().tools.find(tool => tool.id === id);
        if (!summary) return false;

        /* Check the tool's display name */
        let matchesName = match(this.searchTerm, summary.displayName);
        if (matchesName) return true;

        /* Check the vendor information */
        let matchesVendor = match(this.searchTerm, summary.vendor.displayName);
        if (matchesVendor) return true;

        return false;
    };

    constructor(protected query: QueryFunction) {}

    private isImporting(tool: ToolSummary, status: Status) {
        return (
            (this.incv1 &&
                ((this.inccs && tool.fmi1.master === status) || (this.incme && tool.fmi1.import === status))) ||
            ((this.incv2 && (this.inccs && tool.fmi2.master === status)) || (this.incme && tool.fmi2.import === status))
        );
    }

    private isExporting(tool: ToolSummary, status: Status) {
        return (
            (this.incv1 &&
                ((this.inccs && tool.fmi1.slave === status) || (this.incme && tool.fmi1.export === status))) ||
            ((this.incv2 && (this.inccs && tool.fmi2.slave === status)) || (this.incme && tool.fmi2.export === status))
        );
    }
}

function match(term: string, str: string) {
    return str.toLowerCase().indexOf(term.toLowerCase()) >= 0;
}
