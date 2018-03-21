export function truncate(str: string): string {
    if (str === undefined) {
        return "<undefined>";
    }
    if (str.length > 12) return str.slice(0, 12) + "...";
    return str;
}

export function sortStrings(a: string, b: string) {
    let al = a.toLowerCase();
    let bl = b.toLowerCase();
    if (al < bl) return -1;
    if (al > bl) return 1;
    return 0;
}
