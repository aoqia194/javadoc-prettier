# javadoc-prettier

Javadoc (but) Prettier is a postprocessor script to help with styling Javadoc pages by parsing the contents after the (trash) bundled javadoc scripts have run.

> [!IMPORTANT]
> This is still experimental, and may break at any point. It should be noted that Oracle may (at any point) update their scripts and potentially break something, though it is unlikely.

### Themes

There only exists a custom dark theme I've made, but you can make themes however you want.
To include this theme with your javadoc, when you are generating it add a dummy stylesheet that has an import tag pointing to the raw theme URL in the `dist/themes` repository folder.

### Javadoc Generation

If the method you use to generate javadocs allows you to pass arguments to `javadoc`, you can pass custom stylesheets and scripts to javadoc and it will include them in the HTML files as well as copy those files over into the respective `resource-files` and `script-files` folders.
You can download the latest release files and then add them manually via the javadoc arguments:

```sh
javadoc ... --add-script "path/to/javadoc-prettier.min.js" --add-stylesheet "path/to/vscode-dark-modern.min.css"
```

Getting the latest theme release however can be annoying, so you can create a dummy CSS file that will just import the styles from the latest release, like so:

```css
@import url("https://raw.githubusercontent.com/aoqia194/javadoc-prettier/refs/heads/main/dist/themes/vscode-dark-modern.min.css");
```

The css themes do not get included in releases as they are always latest, so you can find them all in the repository's `themes` folder.

For example, the javadoc args used for [ProjectZomboidJavaDocs](https://github.com/demiurgeQuantified/ProjectZomboidJavaDocs) usually contain:

```sh
-quiet -Xdoclint:all,-missing -notimestamp -header "Unofficial PZ JavaDocs 42.13.0" --add-stylesheet "C:/dev/zomboid/javadoc/dummy/javadoc-prettier.min.css" --add-script "C:/dev/zomboid/javadoc/dummy/javadoc-prettier.min.js"
```

### Building

This project uses Bun purely as a developer environment and for artifact minification, but in the end it is transpiled into JavaScript as seen in `dist` folder.
To do stuff with Bun, you can check out the `package.json` to see which scripts there are, and run them using `bun run <script>`.

You want to run `bun install` to get the dependencies.
Typically, for development I run `bun run dev`. For release, I run both `bun run build` and `bun run build-min`.
