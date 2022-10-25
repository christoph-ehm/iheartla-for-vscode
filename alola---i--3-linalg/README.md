# Compilable Linear Algebra with I❤️LA

This extension attempts to provide some very first language support for writing executable linear algebra formulas for Visual Studio Code.

Syntax highlighting and possibly some error highlighting is one goal. The grammar is context-sensitive so that semantic syntax highlighting becomes useful, in particular for juxtaposed variables.
Another goal is to provide some handy automation actions to quickly execute and compile linear algebra formulas per click.

[See the GitHub website for more information about I❤️LA](https://iheartla.github.io/)

## Features

### Code Highlighting

### Code Highlighting

It supports syntax highlighting of I❤️LA syntax for the latest release as of Sep. 2022. It also highlights juxtaposed variables for better readability and to prevent confusion with I❤️LA's variable recognition algorithm.

<!-- lost the image somehow, just take an example from the website with the extension -->
![syntax-example-image](images/alola-syntax-highlight.png)

### Compilation Tasks

Visual Studio Code tasks can be found in the `.vscode/tasks.json` file. It's recommend to add them to the user space tasks to make them globally available. The file path of the compiled `iheartla` executable must be added to the `settings.json` (workspace or user space) as `"iheartla.path": "<path-to-iheartla>"` for the tasks to succeed.

Tasks can be executed via *CTRL+SHIFT+P* which opens the command palette and then choosing `Tasks: Run Task` (configuring an own keybinding for this command is recommended). After that, the appropriate task to be run can be selected from the drop down list.

## Requirements

You need to compile I❤️LA for yourself with PyInstaller since releases are not featured for multiple OSes on GitHub. [Get releases on Github](https://github.com/iheartla/iheartla/releases).

[how to compile using the .spec file]

Also install an extension which turns escape sequences like `\sqrt` into `√` (see below). As of Sep 2022, the list of provided escape sequences is not sufficient for I❤️LA however. Use `Windows+.` key combination on Windows to open an emoji window. On Linux distributions, there is often some distribution-specific unicode program or use the online compiler.

Unicode math symbols:

- [Unicode LaTeX Input [based on Julia's symbols]](https://marketplace.visualstudio.com/items?itemName=gao-shuhua.vsc-unicode-latex)
- [Latex-Input](https://marketplace.visualstudio.com/items?itemName=yellpika.latex-inputv)
  - also mainly math symbols, not all I❤️LA symbols available but some handy shortnames like `\R` and `\Z`
- there is an extension `Fast Unicode Math Characters` but it can only be used for specific languages

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Incomplete extension code. Semantic highlighting not complete. It lacks the colorization implementation which just would assign the i-th variable in source code the (i % colourCount)-th colour. It lacks a differentation of declaration, definition, assignment of variables. That means the current attempt might have a bug because the code for obtaining variables for colorization could split new defined variables into different juxtaposed colorized variable names.

Variables are matched in SourceLine class.

## Contact Me

… when there are issues, you want to contribute or maintain the extension so that we can avoid throwing clone extensions on the market place.

## Release Notes

Users appreciate release notes as you update your extension.

### Releases and History

<!-- @import "./CHANGELOG.md" -->

See [CHANGELOG.md]()

## Developing this extension

1) Copy this extension's code repository on your PC.
2) open the `ALOLA---I--3-LINALG` folder in VSCode
3) run `npm install` in a terminal (in that folder)
4) start testing the extension with F5 or CTRL+F5 and restart with CTRL+SHIFT+F5
   (it automatically runs a task to translate the tmLanguage yaml to json)
5) Please write tests for each feature

---

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
