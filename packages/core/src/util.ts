export function getClassPackageName(name: string) {
    return name.slice(0, name.lastIndexOf("."));
}

export function getTextNodes(e: Node): Text[] {
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, null);

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
        nodes.push(node as Text);
    }

    return nodes;
}

export function addClassToChild(parent: HTMLElement, selector: string, clazz: string) {
    parent.querySelector(selector)!.classList.add(clazz);
}

export function assert(condition: boolean, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}
