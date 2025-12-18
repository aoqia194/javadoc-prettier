import { parseClassDescriptions } from "./parser/class-description";
import { parseDetails } from "./parser/details";
import { parseHeader } from "./parser/header";
import { parseInheritanceTrees } from "./parser/inheritance-tree";
import { parseSummaries } from "./parser/summary";

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
