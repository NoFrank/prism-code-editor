import { languages } from '../core.js';

languages.hoon = {
	'comment': {
		pattern: /::.*/g,
		greedy: true
	},
	'string': {
		pattern: /"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'/g,
		greedy: true
	},
	'constant': /%(?:\.[ny]|[\w-]+)/,
	'class-name': /@(?:[a-z\d-]*[a-z\d])?|\*/i,
	'function': /(?:\+[+-] {2})?(?:[a-z](?:[a-z\d-]*[a-z\d])?)/,
	'keyword': /\.[+*=?^]|![.:?!=<>]|=[.,:;~?|^<>/*+-]|\?[|.:^<>&~=@!+-]|\|[$_%.:^~*=@?-]|\+[|$+*]|:[_^~*+-]|%[_.:^~*=+]|\^[|.:&~*=?+-]|\$[|_%:<>^&~@=?-]|;[<:;/~*=+]|~[%&|$_?!=<>/+]|--|==/
};
