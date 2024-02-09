import { languages, rest } from '../core.js';
import { boolean } from '../utils/shared.js';

var interpolation = [
	{
		// Allow for one nested level of braces inside interpolation
		pattern: /(^|[^\\])\$\{(?:[^'"{}]|\{[^}]*\}|(["'])(?:(?!\2)[^\\]|\\[\s\S])*\2)+\}/,
		lookbehind: true,
		inside: {
			'short-variable': {
				// Negative look-ahead prevent wrong highlighting of functions
				pattern: /(^\$\{)(?!\w+\()(?:::)?\w+(?:::\w+)*/,
				lookbehind: true,
				alias: 'variable',
				inside: {
					'punctuation': /::/
				}
			},
			'delimiter': {
				pattern: /^\$/,
				alias: 'variable'
			}
		}
	},
	{
		pattern: /(^|[^\\])\$(?:::)?\w+(?:::\w+)*/,
		lookbehind: true,
		alias: 'variable',
		inside: {
			'punctuation': /::/
		}
	}
];

interpolation[0].inside[rest] = languages.puppet = {
	'heredoc': [
		// Matches the content of a quoted heredoc string (subject to interpolation)
		{
			pattern: /(@\("([^"\n\/):]+)"(?:\/[nrts$uL]*)?\).*\n)(?:.*\n)*?[ \t]*(?:\|[ \t]*)?(?:-[ \t]*)?\2/,
			lookbehind: true,
			alias: 'string',
			inside: {
				// Matches the end tag
				'punctuation': /(?!\s).*\S(?= *$)/,
				// See interpolation below
				'interpolation': interpolation
			}
		},
		// Matches the content of an unquoted heredoc string (no interpolation)
		{
			pattern: /(@\(([^"\n\/):]+)(?:\/[nrts$uL]*)?\).*\n)(?:.*\n)*?[ \t]*(?:\|[ \t]*)?(?:-[ \t]*)?\2/g,
			lookbehind: true,
			greedy: true,
			alias: 'string',
			inside: {
				// Matches the end tag
				'punctuation': /(?!\s).*\S(?= *$)/
			}
		},
		// Matches the start tag of heredoc strings
		{
			pattern: /@\("?(?:[^"\n\/):]+)"?(?:\/[nrts$uL]*)?\)/,
			alias: 'string',
			inside: {
				'punctuation': {
					pattern: /(\().+?(?=\))/,
					lookbehind: true
				}
			}
		}
	],
	'multiline-comment': {
		pattern: /\/\*[\s\S]*?\*\//g,
		greedy: true,
		alias: 'comment'
	},
	'regex': {
		// Must be prefixed with the keyword "node" or a non-word char
		pattern: /((?:\bnode\s+|[~=\(\[\{,]\s*|[=+]>\s*|^\s*))\/(?:[^\/\\]|\\[\s\S])+\/(?:[imx]+\b|\B)/g,
		lookbehind: true,
		greedy: true,
		inside: {
			// Extended regexes must have the x flag. They can contain single-line comments.
			'extended-regex': {
				pattern: /^\/(?:[^\/\\]|\\[\s\S])+\/[im]*x[im]*$/,
				inside: {
					'comment': /#.*/
				}
			}
		}
	},
	'comment': {
		pattern: /#.*/g,
		greedy: true,
	},
	'string': {
		// Allow for one nested level of double quotes inside interpolation
		pattern: /(["'])(?:\$\{(?:[^'"}]|(["'])(?:(?!\2)[^\\]|\\[\s\S])*\2)+\}|\$(?!\{)|(?!\1)[^\\$]|\\[\s\S])*\1/g,
		greedy: true,
		inside: {
			'double-quoted': {
				pattern: /^"[\s\S]*"$/,
				inside: {
					'interpolation': interpolation
				}
			}
		}
	},
	'variable': {
		pattern: /\$(?:::)?\w+(?:::\w+)*/,
		inside: {
			'punctuation': /::/
		}
	},
	'attr-name': /(?:\b\w+|\*)(?=\s*=>)/,
	'function': [
		{
			pattern: /(\.)(?!\d)\w+/,
			lookbehind: true
		},
		/\b(?:contain|debug|err|fail|include|info|notice|realize|require|tag|warning)\b|\b(?!\d)\w+(?=\()/
	],
	'number': /\b(?:0x[a-f\d]+|\d+(?:\.\d+)?(?:e-?\d+)?)\b/i,
	'boolean': boolean,
	// Includes words reserved for future use
	'keyword': /\b(?:application|attr|case|class|consumes|default|define|else|elsif|function|if|import|inherits|node|private|produces|type|undef|unless)\b/,
	'datatype': {
		pattern: /\b(?:Any|Array|Boolean|Callable|Catalogentry|Class|Collection|Data|Default|Enum|Float|Hash|Integer|NotUndef|Numeric|Optional|Pattern|Regexp|Resource|Runtime|Scalar|String|Struct|Tuple|Type|Undef|Variant)\b/,
		alias: 'symbol'
	},
	'operator': /=[=~>]?|![=~]?|<(?:<\|?|[=~|-])?|>[>=]?|->?|~>|\|>?>?|[*\/%+?]|\b(?:and|in|or)\b/,
	'punctuation': /[[\]{}().,;]|:+/
};
