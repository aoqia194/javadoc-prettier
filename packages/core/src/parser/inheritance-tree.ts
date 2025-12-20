import { CSS_CLASSES, LOGGER, SELECTORS } from "../constants.ts";
import { hasParsed } from "../parser.ts";

export function parseInheritanceTrees() {
    LOGGER.debug("Parsing inheritance trees...");

    document.querySelectorAll(SELECTORS.inheritanceTree).forEach(parseInheritanceTree);
}

function parseInheritanceTree(tree: Element) {
    if (!(tree instanceof HTMLElement) || hasParsed(tree)) {
        return;
    }

    const label = tree.firstElementChild;
    if (!label) {
        // label = tree;
        return;
    }

    label.classList.add(CSS_CLASSES.theme.class);
}
