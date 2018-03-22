import { StateController } from "./types";
import { observable } from "mobx";

/**
 * MemoryState implements the StateController interface by simply declaring a bunch
 * of @observable variables internally and then providing setters to manipulate
 * them (remember, the StateController marks all the states as readonly).
 */
export class MemoryState implements StateController {
    /** Currently selected tool */
    @observable selection: string | null = null;
    /** Version of FMI to filter on (if any) */
    @observable version: string | null = null;
    /** Variant of FMI to filter on (if any) */
    @observable variant: string | null = null;
    /** Platform to filter on (if any) */
    @observable platform: string | null = null;
    /** Whether to show available and planned support */
    @observable unchecked = false;
    /** A search term */
    @observable search: string = "";

    setSelection(id: string | null) {
        this.selection = id;
    }
    setVersion(id: string | null) {
        this.version = id;
    }
    setVariant(id: string | null) {
        this.variant = id;
    }
    setPlatform(id: string | null) {
        this.platform = id;
    }
    setSearch(term: string) {
        this.search = term;
    }
    setUnchecked(flag: boolean) {
        this.unchecked = flag;
    }
}
