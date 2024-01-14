import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './clike.js';

var expression = {
	pattern: /[\s\S]+/
}

var interpolation = {
	pattern: /((?:^|[^\\$])(?:\\{2})*)\$(?:\w+|\{[^{}]*\})/,
	lookbehind: true,
	inside: {
		'interpolation-punctuation': {
			pattern: /^\$\{?|\}$/,
			alias: 'punctuation',
		},
		'expression': expression,
	},
};

var gradle = expression.inside = languages.gradle = extend('clike', {
	'string': {
		pattern: /'''(?:[^\\]|\\[\s\S])*?'''|'(?:\\.|[^\\'\n])*'/,
		greedy: true,
	},
	'keyword':
		/\b(?:apply|def|dependencies|else|if|implementation|import|plugin|plugins|project|repositories|repository|sourceSets|tasks|val)\b/,
	'number': /\b(?:0b[01_]+|0x[\da-f_]+(?:\.[\da-f_p\-]+)?|[\d_]+(?:\.[\d_]+)?(?:e[+-]?\d+)?)[glidf]?\b/i,
	'operator': {
		pattern:
			/(^|[^.])(?:~|==?~?|\?[.:]?|\*(?:[.=]|\*=?)?|\.[@&]|\.\.<|\.\.(?!\.)|-[-=>]?|\+[+=]?|!=?|<(?:<=?|=>?)?|>(?:>>?=?|=)?|&[&=]?|\|[|=]?|\/=?|\^=?|%=?)/,
		lookbehind: true,
	},
	'punctuation': /\.+|[{}[\];(),:$]/,
});

insertBefore(gradle, 'string', {
	'shebang': {
		pattern: /#!.+/,
		alias: 'comment',
		greedy: true,
	},
	'interpolation-string': {
		pattern:
			/"""(?:[^\\]|\\[\s\S])*?"""|(["/])(?:\\.|(?!\1)[^\\\n])*\1|\$\/(?:[^/$]|\$(?:[/$]|(?![/$]))|\/(?!\$))*\/\$/,
		greedy: true,
		inside: {
			'interpolation': interpolation,
			'string': /[\s\S]+/,
		},
	},
});

insertBefore(gradle, 'punctuation', {
	'spock-block': /\b(?:and|cleanup|expect|given|setup|then|when|where):/,
});

insertBefore(gradle, 'function', {
	'annotation': {
		pattern: /(^|[^.])@\w+/,
		lookbehind: true,
		alias: 'punctuation',
	},
});
