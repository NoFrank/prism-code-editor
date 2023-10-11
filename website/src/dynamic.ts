import Prism from "prism-code-editor/prism-core"
import "prism-code-editor/search.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/code-folding.css"
import "prism-code-editor/rtl-layout.css"
import "prism-code-editor/languages"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"
import "prismjs/components/prism-css-extras"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prism-code-editor/prism-markdown"
import "prismjs/components/prism-python"
import "prismjs/components/prism-clike"
import { copyButton } from "prism-code-editor/copy-button"
import { defaultCommands } from "prism-code-editor/commands"
import { highlightSelectionMatches, searchWidget } from "prism-code-editor/search"
import { cursorPosition } from "prism-code-editor/cursor"
import { readOnlyCodeFolding } from "prism-code-editor/code-folding"
import { matchTags } from "prism-code-editor/match-tags"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
import { addOverscroll } from "prism-code-editor/tooltips"

import {
	EditorOptions,
	PrismEditor,
	createEditor,
	editorFromPlaceholder,
	getModifierCode,
	isMac,
} from "prism-code-editor"
import { loadTheme } from "prism-code-editor/themes"
import { editor, editors, placeholders, startOptions, style, wrapper } from "./index"
import { startCode } from "./examples1"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"
import { code } from "./examples2"

// @ts-ignore
delete Prism.languages.jsx.style // @ts-ignore
delete Prism.languages.jsx.script // @ts-ignore
delete Prism.languages.tsx.style // @ts-ignore
delete Prism.languages.tsx.script

// @ts-ignore
Prism.languages.markup.tag.addInlined("script", "javascript")

// @ts-ignore
// add attribute support for all DOM events.
// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
Prism.languages.markup.tag.addAttribute(
	"on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)",
	"javascript",
)

let currentOptions = startOptions
let scrollPos: [number, number] = [0, 0]
let activeEditor = 0
let editor1: PrismEditor

const tabs = wrapper.querySelectorAll(".tab")
const errorEl = <HTMLDivElement>wrapper.querySelector(".error")!
const errorMessage = <HTMLPreElement>errorEl.lastElementChild

const makeEditor = (container: ParentNode | string, options?: Partial<EditorOptions>) =>
	createEditor(Prism, container, options, matchBrackets(true), indentGuides())

const runBtn = <HTMLButtonElement>document.getElementById("run")

const theme = <HTMLSelectElement>document.getElementById("themes"),
	addExtensions = (editor: PrismEditor) => {
		editor.addExtensions(
			searchWidget(),
			highlightSelectionMatches(),
			matchTags(),
			highlightBracketPairs(),
			defaultCommands(),
			cursorPosition(),
		)
	},
	toggleActive = () => {
		if (!editor1) {
			addExtensions(
				(editor1 = makeEditor(wrapper, {
					language: "html",
					value: startCode,
				})),
			)
		}
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

const langs = ["tsx", "jsx", "typescript", "javascript", "typescript", "html", "javascript", "html"]

const inputs = ["readOnly", "wordWrap", "lineNumbers"].map(
	id => <HTMLInputElement>document.getElementById(id)!,
)

const commands = editor.keyCommandMap,
	oldEnter = commands.Enter

const observer = new IntersectionObserver(entries =>
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			const target = <HTMLElement>entry.target
			const index = [].indexOf.call(placeholders, <never>target)
			const editor = (editors[index] = editorFromPlaceholder(
				Prism,
				target,
				{
					readOnly: index > 7 || inputs[0].checked,
					wordWrap: inputs[1].checked,
					lineNumbers: inputs[2].checked,
					language: langs[index - 1],
					value: code[index - 1],
				},
				matchBrackets(true),
				indentGuides(),
				copyButton(),
			))
			addExtensions(editor)
			if (index == 8) {
				editor.addExtensions(readOnlyCodeFolding())
				addOverscroll(editor)
			}
			observer.unobserve(target)
		}
	}),
)

placeholders.forEach((el, i) => i && observer.observe(el))

editor.options.onUpdate = code => runBtn.setAttribute("aria-hidden", <any>(currentOptions == code))

runBtn.title = isMac ? "(Cmd + Enter)" : "(Ctrl + Enter)"

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
		newEditor = makeEditor(wrapper, options)
	} catch (error) {
		errorEl.removeAttribute("aria-hidden")
		errorMessage.textContent = <string>error
		return
	}

	editor1?.remove()
	addExtensions?.((editor1 = newEditor))
	toggleActive()
	newEditor.textarea.focus()
}

inputs.forEach(
	input =>
		(input.onchange = () => {
			let options = {
				[input.id]: input.checked,
			}
			editors.forEach((editor, i) => {
				if (input.id != "readOnly" || i < 8) editor.setOptions(options)
			})
		}),
)
;[editor, editors[0]].forEach(addExtensions)
editors[0].addExtensions(copyButton())

commands.Enter = (e, selection, value) => {
	if (getModifierCode(e) == (isMac ? 4 : 2) && value != currentOptions) {
		runBtn.click()
		return true
	} else return oldEnter!(e, selection, value)
}

theme.oninput = () => {
	loadTheme(theme.value.toLowerCase().replace(/ /g, "-")).then(theme => {
		style.textContent = theme!
	})
}
;(<HTMLDivElement>wrapper.firstElementChild).onclick = e => {
	if ((<HTMLElement>e.target).matches(".tab:not(.active)")) toggleActive()
}
