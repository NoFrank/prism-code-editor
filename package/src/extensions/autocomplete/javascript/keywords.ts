import { JSContext } from "."
import { Completion, CompletionSource } from "../types.js"

const jsKeyWords: Completion[] =
	"as,await,break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,let,new,null,of,package,return,static,super,switch,this,throw,try,typeof,undefined,var,void,while,with,yield"
		.split(",")
		.map(name => ({ label: name }))

const tsKeywords: Completion[] = jsKeyWords.concat(
	"abstract,any,asserts,boolean,declare,enum,infer,interface,is,keyof,module,namespace,never,number,private,protected,public,readonly,string,symbol,type,unknown"
		.split(",")
		.map(name => ({ label: name })),
)

const completeKeywords: CompletionSource<JSContext> = ({ path, explicit, language, pos }) => {
	if (path?.length == 1 && (path[0] || explicit)) {
		return {
			from: pos - path[0].length,
			options: language[0] == "t" ? tsKeywords : jsKeyWords,
		}
	}
}

export { completeKeywords }
