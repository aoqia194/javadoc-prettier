import {
    CSS_CLASSES,
    JAVA_KEYWORDS,
    JAVA_PRIMITIVE_TYPES,
    REGEX,
    TokenType,
} from "../constants.ts";
import { hasParsed } from "../parser.ts";
import { getClassPackageName } from "../util.ts";

/**
 * For class types in lists such as:
 *   - All Implemented Interfaces
 *   - Direct Known Subclasses
 */
export function parseClassList(list: Element) {
    if (!(list instanceof HTMLElement) || hasParsed(list)) {
        return;
    }

    const nodes: Array<ChildNode> = Array.from(list.childNodes);
    nodes.forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
            if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLAnchorElement) {
                node.classList.add(CSS_CLASSES.theme.class);
            }
            return;
        }

        parseTokens(node as Text);
    });
}

export function parseTokens(node: Text) {
    const tokens = parseTokensFromText(node.data);
    if (tokens.length === 0) {
        return;
    }

    replaceTokens(node, tokens);
}

export function parseTokensWithType(node: Text, type: TokenType) {
    const tokens = parseTokensFromText(node.data);
    if (tokens.length === 0) {
        return;
    }

    replaceTokens(node, tokens, type);
}

function replaceTokens(node: Text, tokens: TokenList, type?: TokenType) {
    const fragment = document.createDocumentFragment();
    tokens.forEach((token) => {
        if (type) {
            token.type = type;
        }

        if (token.type === TokenType.KEYWORD) {
            const span = document.createElement("span");
            span.textContent = token.value;
            span.classList.add(CSS_CLASSES.theme.keyword);
            fragment.appendChild(span);
        } else if (token.type === TokenType.PRIMITIVE) {
            const span = document.createElement("span");
            span.textContent = token.value;
            span.classList.add(CSS_CLASSES.theme.primitive);
            fragment.appendChild(span);
        } else if (token.type === TokenType.CLASS) {
            const span = document.createElement("span");
            span.textContent = token.value;

            if (token.value.includes(".") && !(node.parentElement instanceof HTMLAnchorElement)) {
                span.classList.add(CSS_CLASSES.theme.unresolved);
                span.title = `unresolved type in ${getClassPackageName(token.value)}`;
            } else {
                span.classList.add(CSS_CLASSES.theme.class);
            }

            fragment.appendChild(span);
        } else if (token.type === TokenType.FIELD) {
            const span = document.createElement("span");
            span.textContent = token.value;
            span.classList.add(CSS_CLASSES.theme.fieldName);
            fragment.appendChild(span);
        } else if (token.type === TokenType.SYNTAX) {
            const span = document.createElement("span");
            span.textContent = token.value;
            span.classList.add(CSS_CLASSES.theme.syntax);
            fragment.appendChild(span);
        } else if (token.type === TokenType.UNKNOWN) {
            const span = document.createElement("span");
            span.textContent = token.value;

            // TODO: This is just ewwwww
            //   most cases we kinda already know what its going to be
            //   before this function is called

            const parent = node.parentElement!;
            const parentParent = parent.parentElement!;
            if (parent instanceof HTMLAnchorElement) {
                span.classList.add(CSS_CLASSES.theme.class);
            } else if (
                // Parameters in method detail block.
                parent.classList.contains("parameters") ||
                parentParent.classList.contains("method-summary-table") ||
                parent.firstElementChild?.classList.contains("member-name-link")
            ) {
                span.classList.add(CSS_CLASSES.theme.parameterName);
            } else if (
                // Method names with no parameters in method detail block.
                (parent.nextSibling?.nodeType === Node.TEXT_NODE &&
                    parent.nextSibling?.textContent?.startsWith("(")) ||
                // Method names with parameters in method detail block.
                parentParent.querySelector(".parameters")
            ) {
                span.classList.add(CSS_CLASSES.theme.methodName);
            } else {
                const last = tokens[tokens.length - 1]!;
                if (last.type !== TokenType.SYNTAX && !last.value.endsWith(")")) {
                    span.classList.add(CSS_CLASSES.theme.fieldName);
                } else {
                    span.classList.add(CSS_CLASSES.theme.error);
                }
            }

            fragment.appendChild(span);
        } else {
            fragment.append(token.value);
        }
    });

    node.replaceWith(fragment);
}

export function parseTokensFromText(text: string): TokenList {
    const tokens: TokenList = [];
    let match: RegExpExecArray | null;
    while ((match = REGEX.modifierTypePattern.exec(text)) !== null) {
        const value = match[0];
        const type = Object.keys(match.groups!).find((key) => match!.groups![key])!;
        if (value.length === 0) {
            continue;
        }

        if (type === "word") {
            if (JAVA_KEYWORDS.has(value)) {
                tokens.push({ type: TokenType.KEYWORD, value });
            } else if (JAVA_PRIMITIVE_TYPES.has(value)) {
                tokens.push({ type: TokenType.PRIMITIVE, value });
            } else if (value[0]! >= "a" && value[0]! <= "z" && value.includes(".")) {
                tokens.push({ type: TokenType.CLASS, value });
            } else {
                // Unknown is for when we don't have enough information to deduce the type.
                // The extra work for this is done in `parseTokens`.
                tokens.push({ type: TokenType.UNKNOWN, value });
            }
        } else {
            tokens.push({ type, value });
        }
    }

    return tokens;
}
