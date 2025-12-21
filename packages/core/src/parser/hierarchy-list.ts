import { LOGGER } from "../constants";
import { hasParsed } from "../parser";
import { getTextNodes } from "../util";
import { parseTokens } from "./shared";

export function parseHierarchyLists() {
    LOGGER.debug("Parsing hierarchy lists...");

    document.querySelectorAll(".contents-list").forEach(parseList);
    document.querySelectorAll(".hierarchy .circle:not(:has(ul))").forEach(parseType);
}

function parseList(list: Element) {
    if (!(list instanceof HTMLElement) || hasParsed(list)) {
        return;
    }

    list.querySelectorAll("li > a").forEach((e) => {
        getTextNodes(e).forEach(parseTokens);
    });
}

function parseType(e: Element) {
    if (!(e instanceof HTMLElement) || hasParsed(e)) {
        return;
    }

    getTextNodes(e).forEach(parseTokens);
}
