(function () {
    const script = document.createElement("script");
    script.src =
        "https://cdn.jsdelivr.net/gh/aoqia194/javadoc-prettier@main/dist/core/javadoc-prettier.min.js";

    script.onload = () => {
        console.info("[javadoc-prettier-loader] Script loaded successfully.");
    };

    script.onerror = (e) => {
        console.error("[javadoc-prettier-loader] Failed to load script with error:", e);
    };

    const currentScript = document.currentScript as HTMLScriptElement;
    if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.insertBefore(script, currentScript.nextSibling);
    } else {
        document.head.appendChild(script);
    }
})();
