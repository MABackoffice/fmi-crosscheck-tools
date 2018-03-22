import { MatrixReport, ToolsTable } from "@modelica/fmi-data";

export interface QueryResult {
    formatVersion: string;
    tools: ToolsTable;
    matrix: MatrixReport;
}

export type QueryFunction = (
    version: string | null,
    variant: string | null,
    platform: string | null,
) => Promise<QueryResult>;
