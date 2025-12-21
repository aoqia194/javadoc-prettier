import { parseClassDescriptions } from "./parser/class-description.ts";
import { parseDetails } from "./parser/details.ts";
import { parseHeader } from "./parser/header.ts";
import { parseInheritanceTrees } from "./parser/inheritance-tree.ts";
import { parseSummaries } from "./parser/summary.ts";

export function parse() {
    parseInheritanceTrees();
    // parseHierarchyLists();
    parseClassDescriptions();
    parseSummaries();
    parseDetails();
    parseHeader();
    // TODO: Too expensive... Think about it.
    // parseTableOfContents();
    // TODO: Tricky because it's dynamically updated
    // Probably need to use a mutation observer and watch for DOM changes..
    // parseAutocomplete();
}

export function hasParsed(e: HTMLElement) {
    if (e.dataset["javadocPrettierParsed"]) {
        return true;
    }

    e.dataset["javadocPrettierParsed"] = "1";
    return false;
}
