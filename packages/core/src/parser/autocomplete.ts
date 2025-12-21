import { LOGGER, TokenType } from "../constants";
import { hasParsed } from "../parser";
import { getTextNodes } from "../util";
import { parseTokensWithType } from "./shared";

export function parseAutocomplete() {
    LOGGER.debug("Parsing autocomplete...");

    document.querySelectorAll(".search-result-link").forEach(parseAutocompleteResult);
}

function parseAutocompleteResult(e: Element) {
    if (!(e instanceof HTMLElement) || hasParsed(e)) {
        return;
    }

    const desc = e.querySelector(".search-result-desc")!.textContent;
    if (desc.startsWith("Method") || desc.startsWith("Constructor")) {
        const label = e.querySelector(".search-result-label")!;
        getTextNodes(label).forEach((node) => parseTokensWithType(node, TokenType.METHOD));
    }
}
