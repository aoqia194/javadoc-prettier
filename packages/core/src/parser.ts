import { parseClassDescriptions } from "./parser/class-description.ts";
import { parseDetails } from "./parser/details.ts";
import { parseHeader } from "./parser/header.ts";
import { parseInheritanceTrees } from "./parser/inheritance-tree.ts";
import { parseSummaries } from "./parser/summary.ts";

export function parse() {
    parseInheritanceTrees();
    parseClassDescriptions();
    parseSummaries();
    parseDetails();
    parseHeader();
}

export function hasParsed(e: HTMLElement) {
    if (e.dataset["javadocPrettierParsed"]) {
        return true;
    }

    e.dataset["javadocPrettierParsed"] = "1";
    return false;
}
