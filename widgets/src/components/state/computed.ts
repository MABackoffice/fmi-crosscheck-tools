import { computed } from "mobx";
import { promisedComputed } from "computed-async-mobx";
import { MatrixReport, RowReport, Status, ToolSummary, FMIVersion, FMIVariant } from "@modelica/fmi-data";
import { QueryFunction, QueryResult } from "../data";
import { Columns, UncheckedSupport, StateController } from "./types";

const emptyMatrix: MatrixReport = { tools: [], exportsTo: [], importsFrom: [] };
const emptyResult: QueryResult = { formatVersion: "1", matrix: emptyMatrix, tools: [] };

export class ComputedProperties {
    /** These are the results of the query. */
    results = promisedComputed<QueryResult>(emptyResult, () => {
        return this.query(this.state.version, this.state.variant, this.state.platform);
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
        if (this.state.selection == null) return null;

        for (let i = 0; i < this.matrix.exportsTo.length; i++) {
            if (this.matrix.exportsTo[i].id === this.state.selection) return this.matrix.exportsTo[i];
        }
        // Happens if tool doesn't support export
        return null;
    }

    /** List of all tools that imported FMUs that were exported by the current tool */
    @computed
    get importsFromSelected(): RowReport | null {
        if (this.state.selection == null) return null;

        for (let i = 0; i < this.matrix.importsFrom.length; i++) {
            if (this.matrix.importsFrom[i].id === this.state.selection) return this.matrix.importsFrom[i];
        }
        // Happens if tool doesn't export
        return null;
    }

    @computed
    get incv1() {
        return this.state.version === FMIVersion.FMI1 || this.state.version === undefined;
    }

    @computed
    get incv2() {
        return this.state.version === FMIVersion.FMI2 || this.state.version === undefined;
    }

    @computed
    get inccs() {
        return this.state.variant === FMIVariant.CS || this.state.variant === undefined;
    }

    @computed
    get incme() {
        return this.state.variant === FMIVariant.ME || this.state.variant === undefined;
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
        if (this.state.search === "") return true;

        /* Get ToolSummary */
        let summary = this.results.get().tools.find(tool => tool.id === id);
        if (!summary) return false;

        /* Check the tool's display name */
        let matchesName = match(this.state.search, summary.displayName);
        if (matchesName) return true;

        /* Check the vendor information */
        let matchesVendor = match(this.state.search, summary.vendor.displayName);
        if (matchesVendor) return true;

        return false;
    };

    constructor(protected state: StateController, protected query: QueryFunction) {}

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
