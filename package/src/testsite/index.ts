import { createEditor, EditorOptions, getModifierCode, isMac, PrismEditor } from ".."
import { defaultCommands } from "../extensions/commands"
import { copyButton } from "../extensions/copyButton"
import "../extensions/copyButton/copy.css"
import { cursorPosition } from "../extensions/cursor"
import { indentGuides } from "../extensions/guides"
import guides from "../extensions/guides.ts?raw"
import { matchBrackets } from "../extensions/matchBrackets"
import { highlightSelectionMatches, searchWidget } from "../extensions/search"
import "../extensions/search/search.css"
import "../languages"
import "../layout.css"
import Prism from "../prismCore"
import "./languages"
import "../prismMarkdown"
import "../scrollbar.css"
import { addFullEditor, PrismEditorElement } from "../webComponent"
import "./style.css"
import { matchTags } from "../extensions/matchTags"

const runBtn = <HTMLButtonElement>document.getElementById("run"),
	wrapper = document.querySelector<HTMLDivElement>(".editor-wrapper")!,
	tabs = wrapper.querySelectorAll(".tab"),
	errorEl = <HTMLDivElement>wrapper.querySelector(".error")!,
	errorMessage = <HTMLPreElement>errorEl.lastElementChild,
	createEditorWrapper = (container: ParentNode, options: EditorOptions) => {
		const cursor = cursorPosition()
		const editor = createEditor(
			Prism,
			container,
			options,
			cursor,
			indentGuides(),
			matchTags(),
			matchBrackets(),
			copyButton(),
			highlightSelectionMatches(),
			searchWidget(),
			defaultCommands(cursor),
		)

		return editor
	},
	startCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Prism code editor</title>
  <script src="prism.js" data-manual></script>
  <link rel="stylesheet" href="src/style.css">
  <style>
    
  </style>
</head>
<body>
  
  <script>
    
  </script>
</body>
</html>`

let currentOptions = `const code = '${startCode.replace(/\n/g, "\\n")}'

// Languages available in this example include:
// javascript, html, css, markdown, xml, jsx, python, typescript and tsx

const options = {
  language: 'html',
  insertSpaces: true,
  tabSize: 2,
  lineNumbers: true,
  readOnly: false,
  wordWrap: false,
  value: code,
  onUpdate(code) {},
  onSelectionChange([start, end, direction], code) {},
  onTokenize({ language, code, grammar, tokens }) {}
}`,
	activeEditor = 0,
	scrollPos: [number, number] = [0, 0]

let editor1 = createEditorWrapper(wrapper, {
	language: "html",
	value: startCode,
})

const editor = createEditorWrapper(wrapper, {
		language: "javascript",
		value: currentOptions,
		onUpdate(code) {
			runBtn.setAttribute("aria-hidden", <any>(currentOptions == code))
		},
	}),
	commands = editor.keyCommandMap,
	oldEnter = commands.Enter,
	theme = <HTMLLinkElement>document.getElementById("theme"),
	themes = <HTMLSelectElement>document.getElementById("themes")

editor1.scrollContainer.style.display = "none"
themes.oninput = () => {
	theme.href = theme.href.replace(/[^\/]+(?=\.css$)/, themes.value.toLowerCase().replace(/ /g, "-"))
}

const toggleActive = () => {
	for (const tab of tabs) tab.classList.toggle("active")
	const current = (activeEditor ? editor1 : editor).scrollContainer
	const newEditor = (activeEditor ? editor : editor1).scrollContainer
	newEditor.style.display = ""
	newEditor.scrollTo(...scrollPos)
	scrollPos = [current.scrollLeft, current.scrollTop]
	current.style.display = "none"

	if (!activeEditor) {
		runBtn.setAttribute("aria-hidden", "true")
		errorEl.setAttribute("aria-hidden", "true")
	} else runBtn.setAttribute("aria-hidden", <any>(currentOptions == editor.value))
	activeEditor = +!activeEditor
}

;(<HTMLDivElement>wrapper.firstElementChild).onclick = e => {
	const target = <HTMLElement>e.target
	if (target.matches(".tab:not(.active)")) toggleActive()
}

const tabSizeNode = new Text("2")
const tabSize = <HTMLInputElement>document.getElementById("tab-size")
tabSize.before(tabSizeNode)
tabSize.oninput = () => {
	webComponent.tabSize = +(tabSizeNode.data = tabSize.value)
}

for (const attr of ["word-wrap", "readonly", "line-numbers"]) {
	document.getElementById(attr)!.onchange = () => webComponent.toggleAttribute(attr)
}

const theme2 = <HTMLSelectElement>document.getElementById("themes2")!
theme2.oninput = () => {
	webComponent.theme = theme2.value.toLowerCase().replace(/ /g, "-")
}

runBtn.onclick = () => {
	currentOptions = editor.value
	runBtn.setAttribute("aria-hidden", "true")
	let options: any
	try {
		options = new Function(currentOptions + ";return options")()
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	let newEditor: PrismEditor
	try {
		// Creating a new editor instead of
		newEditor = createEditorWrapper(wrapper, options)
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	editor1.remove()
	editor1 = newEditor
	toggleActive()
	newEditor.textarea.focus()
}

runBtn.title = isMac ? "(Cmd + Enter)" : "(Ctrl + Enter)"

commands.Enter = (e, selection, value) => {
	if (getModifierCode(e) == (isMac ? 4 : 2) && value != currentOptions) {
		runBtn.click()
		return true
	} else return oldEnter!(e, selection, value)
}

addFullEditor(Prism, "prism-editor")

const webComponent = document.querySelector<PrismEditorElement>("prism-editor")!

webComponent.addEventListener("ready", () => {
	webComponent.editor.setOptions({
		value: guides.trimEnd().replace(/\r/g, ""),
	})
})
