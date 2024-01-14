import { languages } from '../core.js';

var statement = {
	pattern: /[\s\S]+/
}

statement.inside = languages.mel = {
	'comment': {
		pattern: /\/\/.*|\/\*[\s\S]*?\*\//,
		greedy: true
	},
	'code': {
		pattern: /`(?:\\.|[^\\`])*`/,
		greedy: true,
		alias: 'italic',
		inside: {
			'delimiter': {
				pattern: /^`|`$/,
				alias: 'punctuation'
			},
			'statement': statement
		}
	},
	'string': {
		pattern: /"(?:\\.|[^\\"\n])*"/,
		greedy: true
	},
	'variable': /\$\w+/,
	'number': /\b0x[\da-fA-F]+\b|\b\d+(?:\.\d*)?|\B\.\d+/,
	'flag': {
		pattern: /-[^\d\W]\w*/,
		alias: 'operator'
	},
	'keyword': /\b(?:break|case|continue|default|do|else|float|for|global|if|in|int|matrix|proc|return|string|switch|vector|while)\b/,
	'function': {
		pattern: /((?:^|[{;])[ \t]*)[a-z_]\w*\b(?!\s*(?:\.(?!\.)|[[{=]))|\b[a-z_]\w*(?=[ \t]*\()/im,
		lookbehind: true,
		greedy: true
	},

	'tensor-punctuation': {
		pattern: /<<|>>/,
		alias: 'punctuation'
	},
	'operator': /\+[+=]?|-[-=]?|&&|\|\||[<>]=?|[*\/!=]=?|[%^]/,
	'punctuation': /[.,:;?\[\](){}]/
};
