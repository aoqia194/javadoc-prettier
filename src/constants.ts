export const JAVA_PRIMITIVE_TYPES = new Set([
    "byte",
    "short",
    "int",
    "long",
    "float",
    "double",
    "char",
    "boolean",
    "void",
]);

export const JAVA_KEYWORDS = new Set([
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
    "throws",
]);

export const NAME = "javadoc-prettier";

export const REGEX = {
    modifierTypePattern: /(?<whitespace>\s+)|(?<syntax>[<>(),;.])|(?<word>\w+(?:\.\w+)*)/g,

    parameterList: /(?<type>\b[\w.]*\w)[\s\u00A0]+(?<name>\w+)/g,
    searchListField: /(?<className>\w+)\.+(?<name>\w+)/,
    searchListConstructor: /(?<![\w.])(?<className>[^\W.]+)\((?<paramList>[^)]*)\)/,
    searchListMethod: /(?<className>\w+)\.(?<name>\w+)\((?<paramList>[^)]*)\)/,
};

export const CSS_CLASSES = {
    theme: {
        keyword: "theme-keyword",
        primitive: "theme-type-primitive",
        class: "theme-type-class",
        unresolved: "theme-type-unresolved",
        fieldName: "theme-field-name",
        comment: "theme-comment",
        methodName: "theme-method-name",
        parameterName: "theme-parameter-name",
        syntax: "theme-syntax",
    },
};

export const SELECTORS = {
    inheritedList: ".inherited-list",
    inheritanceTree: ".inheritance",
    classDescription: "#class-description",
    summaryTable: ".summary-table",
    detailsBlock: ".detail .member-signature",
};

export const IDS = {
    nestedClassSummary: "nested-class-summary",
    fieldSummary: "field-summary",
    constructorSummary: "constructor-summary",
    methodSummary: "method-summary",

    fieldDetails: "field-detail",
    constructorDetails: "constructor-detail",
    methodDetails: "method-detail",
};

export const TYPE_LIST_DELIMITER = ", ";

export const LOGGER = {
    trace: (...args: any[]) => console.trace(`[${NAME}]`, ...args),
    debug: (...args: any[]) => console.debug(`[${NAME}]`, ...args),
    info: (...args: any[]) => console.info(`[${NAME}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${NAME}]`, ...args),
    error: (...args: any[]) => console.error(`[${NAME}]`, ...args),
};

export const enum TokenType {
    KEYWORD = "keyword",
    PRIMITIVE = "primitive",
    UNRESOLVED = "unresolved",
    CLASS = "class",
    WHITESPACE = "whitespace",
    SYNTAX = "syntax",
    UNKNOWN = "unknown",
}

export const VIEWPORT_WIDTH = window.innerWidth;
export const VIEWPORT_HEIGHT = window.innerHeight;
