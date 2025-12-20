import { CSS_CLASSES, LOGGER, SELECTORS } from "../constants.ts";
import { hasParsed } from "../parser.ts";
import { getTextNodes } from "../util.ts";
import { parseClassList, parseTokens } from "./shared.ts";

export function parseClassDescriptions() {
    LOGGER.debug("Parsing class descriptions...");

    // document.querySelectorAll(SELECTORS.classDescription).forEach(parseClassDescription);
    parseClassDescription(document.querySelector(SELECTORS.classDescription)!);
}

function parseClassDescription(e: Element) {
    if (!(e instanceof HTMLElement) || hasParsed(e)) {
        return;
    }

    const prevDisplay = e.style.display;
    e.style.display = "none";

    parseImplementedInterfaces(e.querySelector(".notes > dd > code"));
    parseModifiers(e.querySelector(".modifiers"));
    parseExtendsImplements(e.querySelector(".extends-implements"));

    e.style.display = prevDisplay;
}

function parseImplementedInterfaces(e: Element | null) {
    if (!e) {
        return;
    }

    parseClassList(e);
}

function parseModifiers(e: Element | null) {
    if (!e) {
        return;
    }

    getTextNodes(e).forEach(parseTokens);
}

function parseExtendsImplements(e: Element | null) {
    if (!e) {
        return;
    }

    Array.from(e.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
            if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLAnchorElement) {
                node.classList.add(CSS_CLASSES.theme.class);
            }

            return;
        }

        parseTokens(node as Text);
    });
}
