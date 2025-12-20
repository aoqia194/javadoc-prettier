import { LOGGER } from "../constants.ts";
import { hasParsed } from "../parser.ts";

export function parseHeader() {
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
    a.title = "Theme support from javadoc-prettier 💝";

    const hostname = globalThis.location.hostname;
    if (hostname.endsWith(".github.io")) {
        const githubUser = hostname.split(".")[0];
        const repositoryName = globalThis.location.pathname.replaceAll("/", "");
        a.href = `https://github.com/${githubUser}/${repositoryName}`;
    }

    e.appendChild(a);
}
