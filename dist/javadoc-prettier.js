// src/constants.ts
var JAVA_PRIMITIVE_TYPES = new Set([
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "char",
  "boolean",
  "void"
]);
var JAVA_KEYWORDS = new Set([
  "class",
  "interface",
  "enum",
  "extends",
  "implements",
  "native",
  "protected",
  "private",
  "public",
  "static",
  "final",
  "throws"
]);
var NAME = "javadoc-prettier";
var REGEX = {
  modifierTypePattern: /(?<whitespace>\s+)|(?<syntax>[<>(),;.])|(?<word>\w+(?:\.\w+)*)/g,
  parameterList: /(?<type>\b[\w.]*\w)[\s\u00A0]+(?<name>\w+)/g,
  searchListField: /(?<className>\w+)\.+(?<name>\w+)/,
  searchListConstructor: /(?<![\w.])(?<className>[^\W.]+)\((?<paramList>[^)]*)\)/,
  searchListMethod: /(?<className>\w+)\.(?<name>\w+)\((?<paramList>[^)]*)\)/
};
var CSS_CLASSES = {
  theme: {
    keyword: "theme-keyword",
    primitive: "theme-type-primitive",
    class: "theme-type-class",
    unresolved: "theme-type-unresolved",
    fieldName: "theme-field-name",
    comment: "theme-comment",
    methodName: "theme-method-name",
    parameterName: "theme-parameter-name",
    syntax: "theme-syntax"
  }
};
var SELECTORS = {
  inheritedList: ".inherited-list",
  inheritanceTree: ".inheritance",
  classDescription: "#class-description",
  summaryTable: ".summary-table",
  detailsBlock: ".detail .member-signature"
};
var IDS = {
  nestedClassSummary: "nested-class-summary",
  fieldSummary: "field-summary",
  constructorSummary: "constructor-summary",
  methodSummary: "method-summary",
  fieldDetails: "field-detail",
  constructorDetails: "constructor-detail",
  methodDetails: "method-detail"
};
var LOGGER = {
  trace: (...args) => console.trace(`[${NAME}]`, ...args),
  debug: (...args) => console.debug(`[${NAME}]`, ...args),
  info: (...args) => console.info(`[${NAME}]`, ...args),
  warn: (...args) => console.warn(`[${NAME}]`, ...args),
  error: (...args) => console.error(`[${NAME}]`, ...args)
};
var VIEWPORT_WIDTH = window.innerWidth;
var VIEWPORT_HEIGHT = window.innerHeight;

// src/easter-egg.ts
var EASTER_EGG_TEXT = "christmas";
var SNOWFLAKE_CHARS = ["❄", "❅", "❆"];
function activateEasterEgg() {
  let keyboardBuffer = "";
  function keyboardListener(e) {
    const focusedElement = document.activeElement;
    if (!focusedElement) {
      return;
    }
    const isInputFocused = focusedElement.tagName === "INPUT" || focusedElement.tagName === "TEXTAREA" || focusedElement.tagName === "SELECT" || focusedElement.isContentEditable;
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
  createSnowflakeOverlay();
}
var ACTIVE_SNOWFLAKES = [];
var SNOWFLAKE_PROPS = new WeakMap;
var snowflakeContainer;
function createSnowflakeOverlay() {
  snowflakeContainer = document.createElement("div");
  snowflakeContainer.id = "snowflake-container";
  snowflakeContainer.style.willChange = "contents";
  document.body.appendChild(snowflakeContainer);
  const numFlakes = 50;
  for (let i = 0;i < numFlakes; i++) {
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
function initSnowflake(flake) {
  const char = SNOWFLAKE_CHARS[Math.floor(Math.random() * SNOWFLAKE_CHARS.length)];
  const size = Math.random() * 20 + 20;
  flake.textContent = char;
  flake.style.fontSize = `${size}px`;
  flake.style.opacity = `${Math.random() * 0.6 + 0.4}`;
  flake.style.willChange = "transform";
  SNOWFLAKE_PROPS.set(flake, {
    x: Math.random() * window.innerWidth,
    y: -50,
    speed: Math.random() * 1.5 + 0.5,
    drift: (Math.random() - 0.5) * 0.5,
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 4
  });
  updateSnowflakePosition(flake);
}
function updateSnowflakePosition(flake) {
  const p = SNOWFLAKE_PROPS.get(flake);
  flake.style.transform = `translate3d(${p.x}px, ${p.y}px, 0px) rotate(${p.rotation}deg)`;
}
function getSnowflake() {
  let flake = createSnowflake();
  initSnowflake(flake);
  ACTIVE_SNOWFLAKES.push(flake);
  return flake;
}
function animateSnowflakes() {
  for (let i = ACTIVE_SNOWFLAKES.length - 1;i >= 0; i--) {
    const flake = ACTIVE_SNOWFLAKES[i];
    const p = SNOWFLAKE_PROPS.get(flake);
    p.x += p.drift;
    p.y += p.speed;
    p.rotation += p.rotationSpeed;
    if (p.y > VIEWPORT_HEIGHT) {
      initSnowflake(flake);
    } else {
      updateSnowflakePosition(flake);
    }
  }
  requestAnimationFrame(animateSnowflakes);
}

// src/util.ts
function getClassPackageName(name) {
  return name.slice(0, name.lastIndexOf("."));
}
function getTextNodes(e) {
  const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let node;
  while (node = walker.nextNode()) {
    nodes.push(node);
  }
  return nodes;
}

// src/parser/shared.ts
function parseClassList(list) {
  if (!(list instanceof HTMLElement) || hasParsed(list)) {
    return;
  }
  const nodes = Array.from(list.childNodes);
  nodes.forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) {
      if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLAnchorElement) {
        node.classList.add(CSS_CLASSES.theme.class);
      }
      return;
    }
    parseTokens(node);
  });
}
function parseTokens(node) {
  const tokens = parseTokensFromText(node.data);
  if (tokens.length === 0) {
    return;
  }
  const fragment = document.createDocumentFragment();
  tokens.forEach((token) => {
    if (token.type === "keyword" /* KEYWORD */) {
      const span = document.createElement("span");
      span.textContent = token.value;
      span.classList.add(CSS_CLASSES.theme.keyword);
      fragment.appendChild(span);
    } else if (token.type === "primitive" /* PRIMITIVE */) {
      const span = document.createElement("span");
      span.textContent = token.value;
      span.classList.add(CSS_CLASSES.theme.primitive);
      fragment.appendChild(span);
    } else if (token.type === "class" /* CLASS */) {
      const span = document.createElement("span");
      span.textContent = token.value;
      if (token.value.includes(".") && !(node.parentElement instanceof HTMLAnchorElement)) {
        span.classList.add(CSS_CLASSES.theme.unresolved);
        span.title = `unresolved type in ${getClassPackageName(token.value)}`;
      } else {
        span.classList.add(CSS_CLASSES.theme.class);
      }
      fragment.appendChild(span);
    } else if (token.type === "syntax" /* SYNTAX */) {
      const span = document.createElement("span");
      span.textContent = token.value;
      span.classList.add(CSS_CLASSES.theme.syntax);
      fragment.appendChild(span);
    } else if (token.type === "unknown" /* UNKNOWN */) {
      const span = document.createElement("span");
      span.textContent = token.value;
      const parent = node.parentElement;
      const parentParent = parent.parentElement;
      if (parent instanceof HTMLAnchorElement) {
        span.classList.add(CSS_CLASSES.theme.class);
      } else if (parent.classList.contains("parameters") || parentParent.classList.contains("method-summary-table")) {
        span.classList.add(CSS_CLASSES.theme.parameterName);
      } else if (parent.nextSibling?.nodeType === Node.TEXT_NODE && parent.nextSibling?.textContent?.startsWith("(") || parentParent.querySelector(".parameters")) {
        span.classList.add(CSS_CLASSES.theme.methodName);
      } else {
        span.classList.add(CSS_CLASSES.theme.fieldName);
      }
      fragment.appendChild(span);
    } else {
      fragment.append(token.value);
    }
  });
  node.replaceWith(fragment);
}
function parseTokensFromText(text) {
  const tokens = [];
  let match;
  while ((match = REGEX.modifierTypePattern.exec(text)) !== null) {
    const value = match[0];
    const type = Object.keys(match.groups).find((key) => match.groups[key]);
    if (value.length === 0) {
      continue;
    }
    if (type === "word") {
      if (JAVA_KEYWORDS.has(value)) {
        tokens.push({ type: "keyword" /* KEYWORD */, value });
      } else if (JAVA_PRIMITIVE_TYPES.has(value)) {
        tokens.push({ type: "primitive" /* PRIMITIVE */, value });
      } else if (value[0] >= "a" && value[0] <= "z" && value.includes(".")) {
        tokens.push({ type: "class" /* CLASS */, value });
      } else {
        tokens.push({ type: "unknown" /* UNKNOWN */, value });
      }
    } else {
      tokens.push({ type, value });
    }
  }
  return tokens;
}

// src/parser/class-description.ts
function parseClassDescriptions() {
  LOGGER.debug("Parsing class descriptions...");
  parseClassDescription(document.querySelector(SELECTORS.classDescription));
}
function parseClassDescription(e) {
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
function parseImplementedInterfaces(e) {
  if (!e) {
    return;
  }
  parseClassList(e);
}
function parseModifiers(e) {
  if (!e) {
    return;
  }
  getTextNodes(e).forEach(parseTokens);
}
function parseExtendsImplements(e) {
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
    parseTokens(node);
  });
}

// src/parser/details.ts
function parseDetails() {
  LOGGER.debug("Parsing summary tables...");
  parseDetailsSection(IDS.fieldDetails);
  parseDetailsSection(IDS.constructorDetails);
  parseDetailsSection(IDS.methodDetails);
}
function parseDetailsSection(id) {
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
function parseDetailsBlock(e) {
  if (!(e instanceof HTMLElement) || hasParsed(e)) {
    return;
  }
  getTextNodes(e).forEach(parseTokens);
  e.parentElement?.querySelector(".block")?.classList.add(CSS_CLASSES.theme.comment);
}

// src/parser/header.ts
function parseHeader() {
  LOGGER.debug(`Styling header text...`);
  const e = document.querySelector("div.about-language");
  if (!e || !(e instanceof HTMLElement) || hasParsed(e)) {
    return;
  }
  const text = e.textContent;
  e.replaceChildren();
  const a = document.createElement("a");
  a.classList.add("repository-link");
  a.textContent = text;
  a.title = "Theme support from javadoc-prettier \uD83D\uDC9D";
  if (window.location.hostname.endsWith(".github.io")) {
    const githubUser = window.location.hostname.split(".")[0];
    const repositoryName = window.location.pathname.replaceAll("/", "");
    a.href = `https://github.com/${githubUser}/${repositoryName}`;
  }
  e.appendChild(a);
}

// src/parser/inheritance-tree.ts
function parseInheritanceTrees() {
  LOGGER.debug("Parsing inheritance trees...");
  document.querySelectorAll(SELECTORS.inheritanceTree).forEach(parseInheritanceTree);
}
function parseInheritanceTree(tree) {
  if (!(tree instanceof HTMLElement) || hasParsed(tree)) {
    return;
  }
  const label = tree.firstElementChild;
  if (!label) {
    return;
  }
  label.classList.add(CSS_CLASSES.theme.class);
}

// src/parser/summary.ts
function parseSummaries() {
  LOGGER.debug("Parsing summary tables...");
  parseSummarySection(IDS.nestedClassSummary);
  parseSummarySection(IDS.fieldSummary);
  parseSummarySection(IDS.constructorSummary);
  parseSummarySection(IDS.methodSummary);
}
function parseSummarySection(id) {
  const section = document.getElementById(id);
  if (!section) {
    LOGGER.warn(`No summary table with id ${id} found.`);
    return;
  }
  const prevDisplay = section.style.display;
  section.style.display = "none";
  parseSummaryTable(id, section.querySelector(SELECTORS.summaryTable));
  section.querySelectorAll(SELECTORS.inheritedList).forEach(parseInheritedList);
  section.style.display = prevDisplay;
}
function parseSummaryTable(id, e) {
  if (!(e instanceof HTMLElement) || hasParsed(e)) {
    return;
  }
  const isThreeColumn = e.classList.contains("three-column-summary");
  const isTwoColumn = e.classList.contains("two-column-summary");
  if (isThreeColumn) {
    let second = id === IDS.nestedClassSummary || id === IDS.fieldSummary ? parseSummaryTableName : parseSummaryTableSignature;
    e.querySelectorAll(".col-first > code").forEach(parseSummaryTableType);
    e.querySelectorAll(".col-second > code").forEach(second);
    e.querySelectorAll(".col-last > .block").forEach(parseSummaryTableDesc);
  } else if (isTwoColumn) {
    const first = id === IDS.constructorSummary ? parseSummaryTableSignature : parseSummaryTableName;
    const firstColumnName = id === IDS.constructorSummary ? ".col-constructor-name" : ".col-first";
    e.querySelectorAll(`${firstColumnName} > code`).forEach(first);
    e.querySelectorAll(".col-last > code").forEach(parseSummaryTableDesc);
  } else {
    LOGGER.warn("Summary table found that isn't three/two column.");
  }
}
function parseSummaryTableType(e) {
  getTextNodes(e).forEach(parseTokens);
}
function parseSummaryTableName(e) {
  if (e.childElementCount !== 1) {
    LOGGER.warn("Summary table with name child size !== 1");
    return;
  }
  const node = e.firstElementChild;
  if (node.nodeType !== Node.ELEMENT_NODE) {
    LOGGER.warn("Summary table name had a single node but the wrong type.");
    return;
  }
  let clazz = CSS_CLASSES.theme.fieldName;
  if (node.textContent.includes(".")) {
    clazz = CSS_CLASSES.theme.class;
  }
  node.classList.add(clazz);
}
function parseSummaryTableSignature(e) {
  e.querySelector(".member-name-link").classList.add(CSS_CLASSES.theme.methodName);
  getTextNodes(e).filter((n) => !n.parentElement?.classList.contains("member-name-link")).forEach(parseTokens);
}
function parseSummaryTableDesc(e) {
  e.classList.add(CSS_CLASSES.theme.comment);
}
function parseInheritedList(list) {
  if (!(list instanceof HTMLElement) || hasParsed(list)) {
    return;
  }
  list.querySelector("h3 > a:first-child").classList.add(CSS_CLASSES.theme.class);
  const isField = list.parentElement?.id.startsWith("field");
  const isMethod = list.parentElement?.id.startsWith("method");
  let clazz = CSS_CLASSES.theme.class;
  if (isField) {
    clazz = CSS_CLASSES.theme.fieldName;
  } else if (isMethod) {
    clazz = CSS_CLASSES.theme.methodName;
  }
  const nodes = getTextNodes(list.querySelector("code"));
  nodes.forEach((node) => {
    if (node.parentElement instanceof HTMLAnchorElement) {
      node.parentElement.classList.add(clazz);
      return;
    }
  });
}

// src/parser.ts
function parse() {
  parseInheritanceTrees();
  parseClassDescriptions();
  parseSummaries();
  parseDetails();
  parseHeader();
}
function hasParsed(e) {
  if (e.dataset["javadocPrettierParsed"]) {
    return true;
  }
  e.dataset["javadocPrettierParsed"] = "1";
  return false;
}

// src/index.ts
function waitForIndexes(timeout = 3000) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (memberSearchIndex != null && moduleSearchIndex != null && packageSearchIndex != null && tagSearchIndex != null && typeSearchIndex != null) {
        clearInterval(interval);
        clearTimeout(timeoutId);
        resolve();
      }
    }, 100);
    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Timed out waiting on javadoc's index scripts"));
    }, timeout);
  });
}
document.addEventListener("DOMContentLoaded", init);
async function init() {
  try {
    const beforeWait = performance.now();
    await waitForIndexes().then(() => {
      const afterWait = performance.now();
      LOGGER.info(`Waiting for indexes took ${Number.parseFloat(`${afterWait - beforeWait}`).toFixed()}ms`);
    }).catch((reason) => {
      LOGGER.error("Waiting for indexes raised an error:", reason);
      return;
    });
    $.ui.autocomplete;
    const beforeParser = performance.now();
    parse();
    const afterParser = performance.now();
    LOGGER.info(`Element parser took ${Number.parseFloat(`${afterParser - beforeParser}`).toFixed()}ms!`);
    activateEasterEgg();
  } catch (error) {
    LOGGER.error("An error occurred that stopped the script:", error);
  }
}
