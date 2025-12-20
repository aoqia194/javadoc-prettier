import { CSS_CLASSES, IDS, LOGGER, SELECTORS } from "../constants.ts";
import { hasParsed } from "../parser.ts";
import { getTextNodes } from "../util.ts";
import { parseTokens } from "./shared.ts";

export function parseSummaries() {
    LOGGER.debug("Parsing summary tables...");

    parseSummarySection(IDS.nestedClassSummary);
    parseSummarySection(IDS.fieldSummary);
    parseSummarySection(IDS.constructorSummary);
    parseSummarySection(IDS.methodSummary);
}

function parseSummarySection(id: string) {
    const section = document.getElementById(id);
    if (!section) {
        LOGGER.warn(`No summary table with id ${id} found.`);
        return;
    }

    const prevDisplay = section.style.display;
    section.style.display = "none";

    parseSummaryTable(id, section.querySelector(SELECTORS.summaryTable)!);
    section.querySelectorAll(SELECTORS.inheritedList).forEach(parseInheritedList);

    section.style.display = prevDisplay;
}

function parseSummaryTable(id: string, e: Element) {
    if (!(e instanceof HTMLElement) || hasParsed(e)) {
        return;
    }

    const isThreeColumn = e.classList.contains("three-column-summary");
    const isTwoColumn = e.classList.contains("two-column-summary");
    if (isThreeColumn) {
        const second =
            id === IDS.nestedClassSummary || id === IDS.fieldSummary
                ? parseSummaryTableName
                : parseSummaryTableSignature;

        e.querySelectorAll(".col-first > code").forEach(parseSummaryTableType);
        e.querySelectorAll(".col-second > code").forEach(second);
        e.querySelectorAll(".col-last > .block").forEach(parseSummaryTableDesc);
    } else if (isTwoColumn) {
        const first =
            id === IDS.constructorSummary ? parseSummaryTableSignature : parseSummaryTableName;
        const firstColumnName =
            id === IDS.constructorSummary ? ".col-constructor-name" : ".col-first";

        e.querySelectorAll(`${firstColumnName} > code`).forEach(first);
        e.querySelectorAll(".col-last > code").forEach(parseSummaryTableDesc);
    } else {
        LOGGER.warn("Summary table found that isn't three/two column.");
    }
}

function parseSummaryTableType(e: Element) {
    getTextNodes(e).forEach(parseTokens);
}

function parseSummaryTableName(e: Element) {
    if (e.childElementCount !== 1) {
        LOGGER.warn("Summary table with name child size !== 1");
        return;
    }

    const node = e.firstElementChild!;
    if (node.nodeType !== Node.ELEMENT_NODE) {
        LOGGER.warn("Summary table name had a single node but the wrong type.");
        return;
    }

    let clazz = CSS_CLASSES.theme.fieldName;
    if (node.textContent.includes(".")) {
        clazz = CSS_CLASSES.theme.class;
    }

    (node as HTMLAnchorElement).classList.add(clazz);
}

function parseSummaryTableSignature(e: Element) {
    // Method name
    e.querySelector(".member-name-link")!.classList.add(CSS_CLASSES.theme.methodName);

    // Method params
    getTextNodes(e)
        .filter((n) => !(n as Text).parentElement?.classList.contains("member-name-link"))
        .forEach(parseTokens);
}

function parseSummaryTableDesc(e: Element) {
    e.classList.add(CSS_CLASSES.theme.comment);
}

function parseInheritedList(list: Element) {
    if (!(list instanceof HTMLElement) || hasParsed(list)) {
        return;
    }

    // Header
    list.querySelector("h3 > a:first-child")!.classList.add(CSS_CLASSES.theme.class);

    const isField = list.parentElement?.id.startsWith("field");
    const isMethod = list.parentElement?.id.startsWith("method");

    let clazz = CSS_CLASSES.theme.class;
    if (isField) {
        clazz = CSS_CLASSES.theme.fieldName;
    } else if (isMethod) {
        clazz = CSS_CLASSES.theme.methodName;
    }

    // Actual list
    const nodes = getTextNodes(list.querySelector("code")!);
    nodes.forEach((node) => {
        if (node.parentElement instanceof HTMLAnchorElement) {
            node.parentElement.classList.add(clazz);
            return;
        }

        // parseTokens(node as Text);
    });
}
