import { StateController } from "./controller";
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
 * RouterState is an alternate implementation of StateController where
 * the single source of truth is the location in the history (i.e., drawn from
 * the window.location).  Here we use a collection of @observables effectively
 * as "subjects" in the RxJS sense.  But the single source of truth comes from
 * the history API.  By subscribing to the history, we are able to detect
 * changes in location and update the internal states in response.  For setting
 * state, we use the pushState method on history to change the current location
 * (and our history subscription then picks up those changes just as if the user
 * had types the location change in themselves or even pasted a link).
 *
 * The big advantage of this approach to router state is that it provides
 * DEEP LINKING into different views.
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
