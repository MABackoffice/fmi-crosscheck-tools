export interface FilterController {
    readonly selection: string | null;
    readonly version: string | null;
    readonly variant: string | null;
    readonly platform: string | null;
    setSelection(id: string | null): void;
    setVersion(id: string | null): void;
    setVariant(id: string | null): void;
    setPlatform(id: string | null): void;
}

export interface SearchController {
    readonly search: string;
    readonly unchecked: boolean;

    setSearch(term: string): void;
    setUnchecked(flag: boolean): void;
}

export type StateController = FilterController & SearchController;

export interface Columns {
    tools: string[];
    import_only: string[];
    both: string[];
    export_only: string[];
}

export interface UncheckedSupport {
    planned: string[];
    available: string[];
}
