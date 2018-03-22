import { ToolsTable, CrossCheckResult, createMatrixReport } from "@modelica/fmi-data";
import { QueryFunction, QueryResult } from "./query";

// For production, we use these links
let toolsURI = "/data/tools.json";
let xcURI = "/data/xc_results.json";

if (process.env.NODE_ENV === "development") {
    // For production, we use these links
    console.log("Using development data");
    toolsURI = "http://localhost:3000/sample_data/tools.json";
    xcURI = "http://localhost:3000/sample_data/xc_results.json";
} else {
    console.log("Using production data at:");
    console.log("  " + toolsURI);
    console.log("  " + xcURI);
}

// For production, we should use data pushed to the FMI web site.

async function fetchJSON<T extends {}>(uri: string): Promise<T> {
    let headers = new Headers({
        Accept: "application/json",
    });
    headers.set("Accept", "application/json");

    let req = new Request(uri, {
        method: "GET",
        headers: headers,
    });
    let resp = await fetch(req);
    return resp.json();
}
export function loadData(): QueryFunction {
    let toolsTable = fetchJSON<ToolsTable>(toolsURI);
    let resultsTable = fetchJSON<CrossCheckResult[]>(xcURI);
    // fetch data
    return async (version: string | null, variant: string | null, platform: string | null): Promise<QueryResult> => {
        let tools = await toolsTable;
        let results = await resultsTable;
        let matrix = await createMatrixReport(tools, results, {
            version: version || undefined,
            variant: variant || undefined,
            platform: platform || undefined,
        });
        let ret: QueryResult = {
            formatVersion: "1",
            matrix: matrix,
            tools: tools,
        };
        return ret;
    };
}
