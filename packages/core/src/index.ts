import { activateEasterEgg } from "./easter-egg.ts";
import { LOGGER } from "./constants.ts";
import { parse } from "./parser.ts";

function waitForIndexes(timeout: number = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (
                memberSearchIndex != null &&
                moduleSearchIndex != null &&
                packageSearchIndex != null &&
                tagSearchIndex != null &&
                typeSearchIndex != null
            ) {
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
        await waitForIndexes()
            .then(() => {
                const afterWait = performance.now();
                LOGGER.info(
                    `Waiting for indexes took ${Number.parseFloat(
                        `${afterWait - beforeWait}`
                    ).toFixed()}ms`
                );
            })
            .catch((reason) => {
                LOGGER.error("Waiting for indexes raised an error:", reason);
                return;
            });
        
        // Default javadoc scripts have a bug where the search will
        //   try to use the below before jQuery UI has defined it.
        // Just putting this here will force load jQuery UI or something.
        // I actually don't even know if the above is correct, but this fixes it so idk.
        $.ui.autocomplete;

        const beforeParser = performance.now();
        parse();
        const afterParser = performance.now();
        LOGGER.info(
            `Element parser took ${Number.parseFloat(`${afterParser - beforeParser}`).toFixed()}ms!`
        );

        activateEasterEgg();
    } catch (error) {
        LOGGER.error("An error occurred that stopped the script:", error);
    }
}
