import { StateController } from "./types";
import { observable, action } from "mobx";
import { History } from "history";
import createHistory from "history/createBrowserHistory";
import * as qs from "qs";

interface QueryParameters {
    tool: string;
    version: string;
    variant: string;
    platform: string;
    search: string;
}

/**
 * MemoryState implements the StateController interface by simply declaring a bunch
 * of @observable variables internally and then providing setters to manipulate
 * them (remember, the StateController marks all the states as readonly).
 */
export class RouterState implements StateController {
    protected history: History;

    /** Currently selected tool */
    @observable selection: string | null = null;
    /** Version of FMI to filter on (if any) */
    @observable version: string | null = null;
    /** Variant of FMI to filter on (if any) */
    @observable variant: string | null = null;
    /** Platform to filter on (if any) */
    @observable platform: string | null = null;
    /** A search term */
    @observable search: string = "";
    /** Whether to show available and planned support */
    @observable unchecked = false;

    constructor() {
        this.history = createHistory();

        // Get the current location.
        const location = this.history.location;

        // Listen for changes to the current location.
        this.history.listen(this.handler);

        this.handler(location, "PUSH");
    }

    updateQuery(query: QueryParameters) {
        let x = { ...query };

        if (!x.tool) delete x.tool;
        if (!x.version) delete x.version;
        if (!x.variant) delete x.variant;
        if (!x.platform) delete x.platform;
        if (!x.search) delete x.search;

        this.history.push({
            search: qs.stringify(x),
        });
    }

    @action
    setSelection = (tool: string | null) => {
        this.updateQuery({
            tool: tool || "",
            version: this.version || "",
            variant: this.variant || "",
            platform: this.platform || "",
            search: this.search,
        });
    };

    @action
    setVersion = (version: string | null) => {
        this.updateQuery({
            tool: this.selection || "",
            version: version || "",
            variant: this.variant || "",
            platform: this.platform || "",
            search: this.search,
        });
    };

    @action
    setVariant = (variant: string | null) => {
        this.updateQuery({
            tool: this.selection || "",
            version: this.version || "",
            variant: variant || "",
            platform: this.platform || "",
            search: this.search,
        });
    };

    @action
    setPlatform = (platform: string | null) => {
        this.updateQuery({
            tool: this.selection || "",
            version: this.version || "",
            variant: this.variant || "",
            platform: platform || "",
            search: this.search,
        });
    };

    @action
    setSearch = (search: string) => {
        this.updateQuery({
            tool: this.selection || "",
            version: this.version || "",
            variant: this.variant || "",
            platform: this.platform || "",
            search: search,
        });
    };

    setUnchecked(flag: boolean) {
        this.unchecked = flag;
        console.log("Setting unchecked to: ", this.unchecked);
    }

    protected handler: History.LocationListener = (loc, act) => {
        let query = qs.parse(loc.search.substring(1)) as QueryParameters;

        let tool = query.tool || null;
        if (tool !== this.selection) this.selection = tool;

        let version = query.version || null;
        if (version !== this.version) this.version = version;
        let variant = query.variant || null;
        if (variant !== this.variant) this.variant = variant;
        let platform = query.platform || null;
        if (platform !== this.platform) this.platform = platform;

        let search = query.search || "";
        if (search !== this.search) this.search = search;
    };
}
