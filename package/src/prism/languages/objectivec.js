import { languages } from '../core.js';
import { extend } from '../utils/language.js';
import './c.js';

languages.objectivec = extend('c', {
	'string': {
		pattern: /@?"(?:\\[\s\S]|[^"\\\n])*"/,
		greedy: true
	},
	'keyword': /\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,
	'operator': /-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/
});

delete languages.objectivec['class-name'];

languages.objc = languages.objectivec;
