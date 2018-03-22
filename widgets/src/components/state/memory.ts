import { BaseState } from "./base";
import { StateController } from "./types";
import { computed } from "mobx";
import { QueryFunction } from "../data";

export class MemoryState extends BaseState implements StateController {
    @computed
    get selection() {
        return this.currentSelection;
    }
    @computed
    get version() {
        return this.currentVersion;
    }
    @computed
    get variant() {
        return this.currentVariant;
    }
    @computed
    get platform() {
        return this.currentPlatform;
    }
    @computed
    get search() {
        return this.searchTerm;
    }
    @computed
    get unchecked() {
        return this.showUnchecked;
    }

    constructor(query: QueryFunction) {
        super(query);
    }

    setSelection(id: string | null) {
        this.currentSelection = id;
    }
    setVersion(id: string | null) {
        this.currentVersion = id;
    }
    setVariant(id: string | null) {
        this.currentVariant = id;
    }
    setPlatform(id: string | null) {
        this.currentPlatform = id;
    }
    setSearch(term: string) {
        this.searchTerm = term;
    }
    setUnchecked(flag: boolean) {
        this.showUnchecked = true;
    }
}
