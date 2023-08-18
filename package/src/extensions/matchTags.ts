import { Extension, PrismEditor } from ".."
import { getClosestToken } from "../utils"

// Using sets instead of Regex for performace
const langsWithTags = new Set("html,markup,mathml,svg,markdown,md,xml,rss,atom,jsx,tsx".split(","))
const langsWithoutVoidTags = new Set("xml,rss,atom,jsx,tsx".split(","))
const voidTags = new Set(
	"area,base,br,col,embed,hr,img,input,link,meta,source,track,wbr".split(","),
)

export interface TagMatcher {
	/**
	 * Array of tuples where each tuple containes the token for a tag, its starting position
	 * in the code and the length of the leftmost punctuation in the tag.
	 */
	readonly tags: [Prism.Token, number, number][]
	/** Array mapping the index of a tag to the index of its matching tag. */
	readonly pairs: (number | undefined)[]
}

export interface TagHighlighter extends Extension {
	/**
	 * The tag matcher used by the extension.
	 *
	 * If the extension was created without a tag matcher,
	 * this will be `undefined` until it's added to an editor.
	 */
	readonly matcher: TagMatcher | undefined
}

export const createTagMatcher = (editor: PrismEditor): TagMatcher => {
	let pairMap: number[],
		tags: [Prism.Token, number, number][],
		stack: [number, string][],
		position: number,
		tagIndex: number,
		matchTags = (tokens: (Prism.Token | string)[], language: string) => {
			pairMap = []
			tags = []
			position = 0
			tagIndex = 0
			stack = []
			matchTagsRecursive(tokens, language)
		},
		matchTagsRecursive = (tokens: (Prism.Token | string)[], language: string) => {
			if (!langsWithTags.has(language)) return true
			for (
				let i = 0,
					l = tokens.length,
					token: string | Prism.Token,
					noVoidTags = langsWithoutVoidTags.has(language);
				i < l;
				i++
			) {
				token = tokens[i]
				if (typeof token != "string") {
					const { content, type } = token

					if (Array.isArray(content)) {
						if (type == "tag") {
							const [{ length: openingLength }, tagName] = <[Prism.Token, string?]>(
								(<Prism.Token>content[0]).content
							)

							const closingLength = (<Prism.Token>content[content.length - 1]).length

							// Skip self-closing tags or JSX fragments
							if (closingLength == 1 && tagName && (noVoidTags || !voidTags.has(tagName))) {
								if (openingLength == 1) {
									stack.push([tagIndex, tagName])
								} else {
									for (let i = stack.length; i; ) {
										const [index, tagName1] = stack[--i]
										if (tagName == tagName1) {
											stack.length = i
											pairMap[(pairMap[tagIndex] = index)] = tagIndex
											break
										}
									}
								}
							}
							tags[tagIndex++] = [token, position, openingLength]
						} else {
							if (
								!matchTagsRecursive(content, type.indexOf("language-") ? language : type.slice(9))
							)
								continue
						}
					}
				}
				position += token.length
			}
		}

	editor.addListener("tokenize", env => {
		matchTags(env.tokens, env.language)
	})

	matchTags(editor.tokens, editor.options.language)

	return {
		get tags() {
			return tags
		},
		get pairs() {
			return pairMap
		},
	}
}
/**
 * Extension that adds classes to matching tags a tag.
 * @param matcher The tag matcher used to match the tags.
 * If omitted, one is created after the extension is added to an editor.
 *
 * Use the CSS selectors `.active-tagname` to style the elements.
 *
 * This extension can safely be added to an editor dynamically.
 */
export const matchTags = (matcher?: TagMatcher): TagHighlighter => {
	let init: boolean, openEl: HTMLSpanElement | null, closeEl: HTMLSpanElement | null

	return {
		update(editor) {
			if (init != (init = true)) {
				matcher ||= createTagMatcher(editor)
				const getClosestTagIndex = (pos: number) => {
					for (let i = 0, tags = matcher!.tags, l = tags.length; i < l; i++)
						if (tags[i][1] <= pos) {
							if (tags[i][1] + tags[i][0].length >= pos) return i
						} else break
				}
				const highlight = (remove?: boolean) => {
					;[openEl, closeEl].forEach(el => {
						el?.classList.toggle("active-tagname", !remove)
					})
				}
				const selectionChange = () => {
					const [start, end] = editor.getSelection()
					if (start == end && editor.focused) {
						let index = getClosestTagIndex(start)
						let newEl1: HTMLSpanElement
						let newEl2: HTMLSpanElement

						if (index! + 1) {
							const tags = matcher!.tags
							const tagData = tags[index!]
							const tag1 = getClosestToken(editor, ".tag>.tag", -tagData[2], 0)
							const otherIndex = matcher!.pairs[index!]

							if (tag1 && otherIndex! + 1) {
								const tag2 = getClosestToken(editor, ".tag>.tag", 0, 0, tags[otherIndex!][1])!
								;[newEl1, newEl2] = [tag1, tag2].map(el => {
									let child = el.lastChild!
									let tagName = (<Text>child).data
									if (tagName) {
										child.replaceWith((child = document.createElement("span")))
										child.textContent = tagName
									}
									return <HTMLSpanElement>child
								})
							}
						}
						if (openEl != newEl1!) {
							highlight(true)
							openEl = newEl1!
							closeEl = newEl2!
							highlight()
						}
					} else {
						highlight(true)
						openEl = closeEl = null
					}
				}
				editor.addListener("selectionChange", selectionChange)
			}
		},
		get matcher() {
			return matcher
		},
	}
}
