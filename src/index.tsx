const EASTER_EGG_TEXT = "christmas";
const SNOWFLAKE_CHARS = ["❄", "❅", "❆"];

const PARAMETER_LIST_REGEX = /(?<type>\b[\w.]*\w)[\s\u00A0]+(?<name>\w+)/g;

const SEARCHRESULT_FIELD_REGEX = /(?<className>\w+)\.+(?<name>\w+)/;
const SEARCHRESULT_CTOR_REGEX = /(?<![\w.])(?<className>[^\W.]+)\((?<paramList>[^)]*)\)/;
const SEARCHRESULT_METHOD_REGEX = /(?<className>\w+)\.(?<name>\w+)\((?<paramList>[^)]*)\)/;

const JAVA_PRIMITIVE_TYPE_KEYWORDS = [
    "byte",
    "short",
    "int",
    "long",
    "float",
    "double",
    "char",
    "boolean",
];

function waitForSearchIndex(timeout: number = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (memberSearchIndex != null) {
            resolve();
            return;
        }

        const interval = setInterval(() => {
            if (memberSearchIndex != null) {
                clearInterval(interval);
                clearTimeout(timeoutId);
                resolve();
            }
        }, 100);

        const timeoutId = setTimeout(() => {
            clearInterval(interval);
            reject(new Error(`Style helper timed out waiting on member-search-index.js`));
        }, timeout);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

async function init() {
    try {
        const beforeWait = performance.now();
        await waitForSearchIndex()
            .then(() => {
                const afterWait = performance.now();
                console.info(
                    `Waiting for search index took ${Number.parseFloat(
                        `${afterWait - beforeWait}`
                    ).toFixed()}ms`
                );
            })
            .catch((reason) => {
                console.error(`Waiting for search index raised an error: ${reason}`);
                return;
            });

        activateEasterEgg();

        const beforeStyle = performance.now();
        styleDocument().then(() => {
            const afterStyle = performance.now();
            console.info(
                `Styling entire document took ${Number.parseFloat(
                    `${afterStyle - beforeStyle}`
                ).toFixed()}ms!`
            );
        });
    } catch (error) {
        console.error("Style helper had an error that stopped it from working: ", error);
    }
}

async function styleDocument() {
    // TODO: Completely reorganise the style changes.
    // For example, maybe having a styleMethods()
    // that has styleModifiers(), styleParameterLists()
    // can also have styleGenerics() that is separate from generic support in the parameter lists
    // maybe have an intermediate function that both styleGenerics and styleParameterLists can use.

    styleUnresolvedTypes();
    // styleGenerics();
    styleMethods();
    styleSearchResults();
    styleLiterals();
    styleHeaderText();
}

async function styleUnresolvedTypes() {
    console.debug("Styling unresolved types...");

    // Unresolved types in class subclass list
    document.querySelectorAll("#class-description .notes > dd > code").forEach((e) => {
        if (!(e instanceof HTMLElement)) {
            return;
        }

        if (hasBeenStyled(e)) {
            return;
        }

        const nodes = Array.from(e.childNodes);
        nodes
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .forEach((node) => {
                const raw = (node as Text).data;
                if (raw === ", ") {
                    return;
                }

                const name = raw.replace(/,\s*$/, "").trim();
                if (!name) {
                    return;
                }

                const fragment = document.createDocumentFragment();

                const span = document.createElement("span");
                span.classList.add("theme-type-unresolved");
                span.textContent = name;
                span.title = `unresolved type in ${getClassPackageName(name)}`;
                fragment.appendChild(span);

                const trailing = raw.slice(raw.lastIndexOf(name) + name.length);
                if (trailing) {
                    fragment.appendChild(document.createTextNode(trailing));
                }

                node.replaceWith(fragment);
            });
    });

    // Unresolved return types
    document.querySelectorAll(".summary-table > .col-first > code, .return-type").forEach((e) => {
        if (!(e instanceof HTMLElement)) {
            return;
        }

        if (hasBeenStyled(e)) {
            return;
        }

        const t = e.textContent;
        if (t.includes(".")) {
            e.classList.add("theme-type-unresolved");
            e.title = `unresolved type in ${getClassPackageName(t)}`;
        }
    });
}

async function styleGenerics() {
    console.debug("Styling generics...");

    // Generics in method details
    document
        .querySelectorAll(
            ".member-signature > .type-parameters, .summary-table > .col-second > code"
        )
        .forEach((e) => {
            if (!(e instanceof HTMLElement)) {
                return;
            }

            if (hasBeenStyled(e)) {
                return;
            }

            const fragment = document.createDocumentFragment();

            // TODO: Implement properly

            const text = e.textContent.slice(1, -1);
            const textSub = text.split(" extends ");
            const genericTypes = textSub[0];
            const extendedTypes = textSub[1];

            const span = document.createElement("span");
            span.classList.add("theme-type-keyword");
            span.textContent = "extends";

            e.append(
                `${genericTypes} `,
                span,
                extendedTypes !== undefined ? ` ${extendedTypes}` : ""
            );

            // fragment.append("<", extendsSpan, ">");

            e.replaceWith(fragment);
        });
}

async function styleMethods() {
    console.debug("Styling methods...");

    styleModifiers();
    styleParameterLists();
    styleMethodDetails();

    // Methods in the USAGE LIST that have prefixed class types
    document
        .querySelectorAll(
            ".class-use-page .class-uses .summary-table > .col-second > .type-name-label"
        )
        .forEach((e) => {
            if (!(e instanceof HTMLElement)) {
                return;
            }

            if (hasBeenStyled(e)) {
                return;
            }

            if (!e.textContent.endsWith(".")) {
                return;
            }

            e.textContent = e.textContent.slice(0, -1);
            e.classList.add("theme-type-class");
            e.insertAdjacentText("afterend", ".");
        });
}

async function styleModifiers() {}

async function styleParameterLists() {
    // The bulk of the method param list parsing for all lists.
    document
        .querySelectorAll(
            "#constructor-summary .summary-table > .col-constructor-name > code," +
                "#method-summary-table .summary-table > .col-second > code," +
                "#constructor-detail .member-list .member-signature > .parameters," +
                "#method-detail .member-list .member-signature > .parameters," +
                ".class-use-page .class-uses .summary-table .col-second > code"
        )
        .forEach((e) => {
            if (!(e instanceof HTMLElement)) {
                return;
            }

            if (hasBeenStyled(e)) {
                return;
            }

            const textNodes = getElementTextNodes(e) as Text[];
            for (const node of textNodes) {
                const text = node.data;
                if (!isTextNodeValid(node)) {
                    continue;
                }

                PARAMETER_LIST_REGEX.lastIndex = 0;
                let m = PARAMETER_LIST_REGEX.exec(text);
                if (!m || m.groups === undefined) {
                    continue;
                }

                const fragment = document.createDocumentFragment();
                let lastIdx = 0;

                do {
                    const type = m.groups["type"]!;
                    const name = m.groups["name"]!;

                    if (m.index > lastIdx) {
                        fragment.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
                    }

                    const typeSpan = document.createElement("span");
                    typeSpan.textContent = type;

                    if (JAVA_PRIMITIVE_TYPE_KEYWORDS.includes(type)) {
                        typeSpan.classList.add("theme-type-primitive");
                    } else {
                        typeSpan.classList.add("theme-type-unresolved");
                        typeSpan.title = `unresolved type in ${getClassPackageName(type)}`;
                    }

                    fragment.appendChild(typeSpan);

                    fragment.appendChild(document.createTextNode("\u00A0"));

                    const nameSpan = document.createElement("span");
                    nameSpan.classList.add("theme-method-param-name");
                    nameSpan.textContent = name;
                    fragment.appendChild(nameSpan);

                    lastIdx = m.index + m[0].length;
                } while ((m = PARAMETER_LIST_REGEX.exec(text)) && m.groups !== undefined);

                if (lastIdx < text.length) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIdx)));
                }

                node.replaceWith(fragment);
            }
        });
}

async function styleMethodDetails() {
    // Methods with the throws keyword in METHOD DETAILS
    document
        .querySelectorAll("#method-detail > .member-list .member-signature > .exceptions")
        .forEach((e) => {
            if (!(e instanceof HTMLElement)) {
                return;
            }

            if (hasBeenStyled(e)) {
                return;
            }

            let node = e.previousSibling;
            if (!node || node.nodeType !== Node.TEXT_NODE) {
                return;
            }

            let text = (node as Text).textContent;
            let lhsEnd = text.indexOf("throws");
            let rhsStart = lhsEnd + ("throws".length + 1);
            if (lhsEnd === -1) {
                return;
            }

            const lhs = text.slice(0, lhsEnd);
            const keyword = text.slice(lhsEnd + 1, rhsStart - 1);
            const rhs = text.slice(rhsStart);

            const fragment = document.createDocumentFragment();

            const span = document.createElement("span");
            span.classList.add("theme-type-keyword");
            span.textContent = keyword;

            fragment.append(lhs, span, rhs);
            node.replaceWith(fragment);
        });

    // Method details with doctag comments referring parameters
    document.querySelectorAll("#method-detail > .member-list .notes > dd").forEach((e) => {
        if (!(e instanceof HTMLElement)) {
            return;
        }

        if (hasBeenStyled(e)) {
            return;
        }

        let node = e.lastChild;
        if (!node || node.nodeType !== Node.TEXT_NODE) {
            return;
        }

        let text = (node as Text).textContent;
        if (!text.startsWith(" - ")) {
            return;
        }

        node.textContent = " - ";
        text = text.slice(3);

        const span = document.createElement("span");
        span.classList.add("theme-doctag-comment");
        span.textContent = text;

        node.after(span);
    });
}

async function styleSearchResults() {
    console.debug("Styling search results...");

    document.querySelectorAll(".search-result-label").forEach((e) => {
        if (!(e instanceof HTMLElement)) {
            return;
        }

        if (hasBeenStyled(e)) {
            return;
        }

        // const nodes = Array.from(e.childNodes);

        let textContent = "";
        let highlightSpan = null;
        let highlightPosition = -1;

        for (const node of e.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                textContent += node.textContent;
            } else if (
                node.nodeType === Node.ELEMENT_NODE &&
                (node as HTMLElement).classList.contains("result-highlight")
            ) {
                highlightSpan = node.cloneNode(true);
                highlightPosition = textContent.length;
                textContent += node.textContent;
            }
        }

        const descEl = e.parentElement && e.parentElement.querySelector(".search-result-desc");
        const description = descEl ? descEl.textContent.toLowerCase() : "";

        let match;

        if (
            description.startsWith("class") ||
            description.startsWith("enum class") ||
            description.startsWith("interface")
        ) {
            const frag = document.createDocumentFragment();

            // TODO: I dont think this works
            const classSpan = document.createElement("span");
            classSpan.classList.add("theme-type-class");

            if (highlightSpan && highlightPosition >= 0 && highlightPosition < textContent.length) {
                const before = textContent.substring(0, highlightPosition);
                if (before) {
                    classSpan.appendChild(document.createTextNode(before));
                }

                classSpan.appendChild(highlightSpan);

                const after = textContent.substring(
                    highlightPosition + highlightSpan.textContent!.length
                );
                if (after) {
                    classSpan.appendChild(document.createTextNode(after));
                }
            } else {
                classSpan.textContent = textContent;
            }

            frag.appendChild(classSpan);
            e.replaceChildren(frag);
            return;
        } else if (
            (match = textContent.match(SEARCHRESULT_CTOR_REGEX)) &&
            match.groups !== undefined
        ) {
            // TODO:
            return;
        } else if (
            (match = textContent.match(SEARCHRESULT_FIELD_REGEX)) &&
            match.groups !== undefined
        ) {
            // TODO:
            return;
        } else if (
            (match = textContent.match(SEARCHRESULT_METHOD_REGEX)) &&
            match.groups !== undefined
        ) {
            const className = match.groups["className"]!;
            const funcName = match.groups["name"]!;
            const params = match.groups["paramList"]!;

            const paramList = params
                .split(",")
                .map((p) => p.trim())
                .filter((p) => p.length > 0);

            const frag = document.createDocumentFragment();

            const classSpan = document.createElement("span");
            classSpan.classList.add("theme-type-class");
            classSpan.textContent = className;
            frag.appendChild(classSpan);

            frag.appendChild(document.createTextNode("."));

            const methodSpan = document.createElement("span");
            methodSpan.classList.add("theme-method-name");

            const start = className.length + 1;
            const end = start + funcName.length;

            if (highlightSpan && highlightPosition >= start && highlightPosition < end) {
                const before = funcName.substring(0, highlightPosition - start);
                const after = funcName.substring(
                    highlightPosition - start + highlightSpan.textContent!.length
                );

                if (before) methodSpan.appendChild(document.createTextNode(before));
                methodSpan.appendChild(highlightSpan);
                if (after) methodSpan.appendChild(document.createTextNode(after));
            } else {
                methodSpan.textContent = funcName;
            }
            frag.appendChild(methodSpan);

            frag.appendChild(document.createTextNode("("));
            for (let i = 0; i < paramList.length; i++) {
                const param = paramList[i]!;
                const paramSpan = document.createElement("span");

                if (JAVA_PRIMITIVE_TYPE_KEYWORDS.includes(param.toLowerCase())) {
                    paramSpan.classList.add("theme-type-primitive");
                } else {
                    paramSpan.classList.add("theme-type-class");
                }

                paramSpan.textContent = param;
                frag.appendChild(paramSpan);

                if (i < paramList.length - 1) {
                    frag.appendChild(document.createTextNode(", "));
                }
            }
            frag.appendChild(document.createTextNode(")"));

            e.replaceChildren(frag);
            return;
        }
    });
}

async function styleLiterals() {
    console.debug("Styling constant literals...");

    document
        .querySelectorAll(
            ".constants-summary > .block-list > li > .summary-table > .col-last > code"
        )
        .forEach((e) => {
            if (!(e instanceof HTMLElement)) {
                return;
            }

            if (hasBeenStyled(e)) {
                return;
            }

            const text = e.textContent;

            if (text.startsWith('"') && text.endsWith('"')) {
                e.classList.add("theme-literal-string");
            } else if (
                text.startsWith("0x") ||
                text.endsWith("f") ||
                text.endsWith("L") ||
                text.endsWith("D") ||
                !isNaN(Number(text))
            ) {
                e.classList.add("theme-literal-number");
            } else if (text === "true" || text === "false") {
                e.classList.add("theme-literal-bool");
            }
        });
}

async function styleHeaderText() {
    console.debug("Styling header text...");

    const e = document.querySelector("div.about-language");
    if (!e || !(e instanceof HTMLElement) || hasBeenStyled(e)) {
        return;
    }

    const text = e.textContent;

    e.replaceChildren();

    const a = document.createElement("a");
    a.classList.add("repository-link");
    a.textContent = text;

    if (window.location.hostname.endsWith(".github.io")) {
        const githubUser = window.location.hostname.split(".")[0];
        const repositoryName = window.location.pathname.replaceAll("/", "");
        a.href = `https://github.com/${githubUser}/${repositoryName}`;
    }

    e.appendChild(a);
}

function hasBeenStyled(e: HTMLElement) {
    if (e.dataset["styled"]) {
        return true;
    }

    e.dataset["styled"] = "1";
    return false;
}

function getClassPackageName(name: string) {
    return name.slice(0, name.lastIndexOf("."));
}

function getElementTextNodes(e: Node) {
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, null);

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
        nodes.push(node);
    }

    return nodes;
}

function isTextNodeValid(node: Text) {
    const text = node.data;
    return text.includes(" ") || text.includes("\u00A0");
}

// -----------------------------------------------------------------------------

function activateEasterEgg() {
    let keyboardBuffer = "";

    function keyboardListener(e: KeyboardEvent) {
        const focusedElement = document.activeElement as HTMLElement;
        if (!focusedElement) {
            return;
        }

        const isInputFocused =
            focusedElement.tagName === "INPUT" ||
            focusedElement.tagName === "TEXTAREA" ||
            focusedElement.tagName === "SELECT" ||
            focusedElement.isContentEditable;

        if (!isInputFocused) {
            if (e.key && e.key.length === 1) {
                keyboardBuffer += e.key.toLowerCase();
            }

            if (keyboardBuffer.includes(EASTER_EGG_TEXT)) {
                startChristmasTheme();
                keyboardBuffer = "";
                document.removeEventListener("keydown", keyboardListener);
            }

            if (keyboardBuffer.length > EASTER_EGG_TEXT.length) {
                keyboardBuffer = keyboardBuffer.slice(-EASTER_EGG_TEXT.length);
            }
        }
    }
    document.addEventListener("keydown", keyboardListener);
}

function startChristmasTheme() {
    (document.querySelector(":root") as HTMLHtmlElement).style.animation =
        "christmas-accent 3s linear infinite";

    createSnowflakeOverlay();
}

const SNOWFLAKE_POOL: HTMLDivElement[] = [];
const ACTIVE_SNOWFLAKES: HTMLDivElement[] = [];
const SNOWFLAKE_PROPS = new WeakMap();
let snowflakeContainer: HTMLDivElement;

function createSnowflakeOverlay() {
    snowflakeContainer = document.createElement("div");
    snowflakeContainer.id = "snowflake-container";
    document.body.appendChild(snowflakeContainer);

    const numFlakes = 50;
    for (let i = 0; i < numFlakes; i++) {
        const flake = getSnowflake();
        const p = SNOWFLAKE_PROPS.get(flake);
        p.y = Math.random() * window.innerHeight - window.innerHeight;
    }

    animateSnowflakes();
}

function createSnowflake() {
    const flake = document.createElement("div");
    flake.classList.add("snowflake-object");
    snowflakeContainer.appendChild(flake);
    return flake;
}

function initSnowflake(flake: HTMLDivElement) {
    const char = SNOWFLAKE_CHARS[Math.floor(Math.random() * SNOWFLAKE_CHARS.length)]!;
    const size = Math.random() * 20 + 20;

    flake.textContent = char;

    flake.style.fontSize = `${size}px`;
    flake.style.opacity = `${Math.random() * 0.6 + 0.4}`;
    flake.style.display = "block";

    SNOWFLAKE_PROPS.set(flake, {
        x: Math.random() * window.innerWidth,
        y: -50,
        speed: Math.random() * 1.5 + 0.5,
        drift: (Math.random() - 0.5) * 0.5,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 4,
    });

    updateSnowflakePosition(flake);
}

function updateSnowflakePosition(flake: HTMLDivElement) {
    const p = SNOWFLAKE_PROPS.get(flake);
    flake.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
}

function getSnowflake() {
    let flake = SNOWFLAKE_POOL.pop();
    if (!flake) {
        flake = createSnowflake();
    }

    initSnowflake(flake);
    ACTIVE_SNOWFLAKES.push(flake);
    return flake;
}

function releaseSnowflake(flake: HTMLDivElement) {
    flake.style.display = "none";

    const idx = ACTIVE_SNOWFLAKES.indexOf(flake);
    if (idx > -1) {
        ACTIVE_SNOWFLAKES.splice(idx, 1);
    }

    SNOWFLAKE_POOL.push(flake);
}

let snowflakeAnimationId: number | null;
function animateSnowflakes() {
    const innerHeight = window.innerHeight + 50;
    for (let i = ACTIVE_SNOWFLAKES.length - 1; i >= 0; i--) {
        const flake = ACTIVE_SNOWFLAKES[i]!;
        const p = SNOWFLAKE_PROPS.get(flake);

        p.x += p.drift;
        p.y += p.speed;
        p.rotation += p.rotationSpeed;

        if (p.y > innerHeight) {
            releaseSnowflake(flake);
            getSnowflake();
        } else {
            updateSnowflakePosition(flake);
        }
    }

    snowflakeAnimationId = requestAnimationFrame(animateSnowflakes);
}
