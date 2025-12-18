import { LOGGER } from "../constants";
import { hasParsed } from "../parser";

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

    if (window.location.hostname.endsWith(".github.io")) {
        const githubUser = window.location.hostname.split(".")[0];
        const repositoryName = window.location.pathname.replaceAll("/", "");
        a.href = `https://github.com/${githubUser}/${repositoryName}`;
    }

    e.appendChild(a);
}
