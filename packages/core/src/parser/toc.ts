import { LOGGER, TokenType } from "../constants";
import { hasParsed } from "../parser";
import { getTextNodes } from "../util";
import { parseTokensWithType } from "./shared";

export function parseTableOfContents() {
    LOGGER.debug("Parsing table of contents...");

    document.querySelectorAll(".toc").forEach(parseToc);
}

function parseToc(toc: Element) {
    if (!(toc instanceof HTMLElement) || hasParsed(toc)) {
        return;
    }

    toc.querySelectorAll(".toc-list > li:has(.toc-list)").forEach((e) => {
        const a = e.querySelector("a");
        if (a?.href.endsWith("#field-detail")) {
            e.querySelectorAll(".toc-list > li:not(:has(.toc-list)) > a").forEach((field) => {
                LOGGER.info("parsing field name");
                getTextNodes(field).forEach((text) => {
                    parseTokensWithType(text, TokenType.FIELD);
                });
            });
        }
    });
}
