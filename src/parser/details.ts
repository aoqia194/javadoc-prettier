import { CSS_CLASSES, IDS, LOGGER, SELECTORS } from "../constants";
import { hasParsed } from "../parser";
import { getTextNodes } from "../util";
import { parseTokens } from "./shared";

export function parseDetails() {
    LOGGER.debug("Parsing summary tables...");

    parseDetailsSection(IDS.fieldDetails);
    parseDetailsSection(IDS.constructorDetails);
    parseDetailsSection(IDS.methodDetails);
}

function parseDetailsSection(id: string) {
    const section = document.getElementById(id);
    if (!section) {
        LOGGER.warn(`No details section with id ${id} found.`);
        return;
    }

    const prevDisplay = section.style.display;
    section.style.display = "none";

    section.querySelectorAll(SELECTORS.detailsBlock).forEach(parseDetailsBlock);

    section.style.display = prevDisplay;
}

function parseDetailsBlock(e: Element) {
    if (!(e instanceof HTMLElement) || hasParsed(e)) {
        return;
    }

    // Thankfully the details block is split up into classes already!
    // However, it's better to parse the tokens anyway
    getTextNodes(e).forEach(parseTokens);
    e.parentElement?.querySelector(".block")?.classList.add(CSS_CLASSES.theme.comment);
}
