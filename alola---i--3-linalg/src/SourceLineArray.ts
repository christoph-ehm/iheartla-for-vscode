import { Range, Position } from 'vscode';
import PCRE from '@stephen-riley/pcre2-wasm';
import { PatternMatch } from './InitalizePCRE';
import { VariablePatternMatch } from './AlolaTokenParser';

export type SourceToken = [ range: Range , patternMatch: PatternMatch , sourceTokenType : SourceTokenType ];
export const _sourceTokenTypes = ["declaration" , "usage" , "other"] as const;
export type SourceTokenType = (typeof _sourceTokenTypes)[number];

export class SourceLine
{
	constructor(readonly offset: number, readonly lineNumber: number, readonly content: string)
	{}

	/** Assumes that there are no variables which span across multiple lines. */
	public parseVariableNames(variablePattern : PCRE, source : SourceLineArray) : SourceToken[]
	{
		const patternMatches : PatternMatch[] = variablePattern.matchAll(this.content, 0);

		return patternMatches.map((patternMatch) => source.createSourceTokenFromVariable(patternMatch, this), source);
	}
}

export class SourceLineArray extends Array<SourceLine>
{
	constructor(readonly source : string)
	{
		super();
		const rawLines = source.split(/\r\n|\r|\n/);

		for(let offset = 0, lineNumber = 1; lineNumber <= rawLines.length; lineNumber++)
		{
			const line = new SourceLine ( offset, lineNumber, rawLines[lineNumber-1] );
			super.push(line);

			offset += line.content.length;
		}
	}

	public parseVariableNames(variablePattern : PCRE) : SourceToken[]
	{
		return this.flatMap(line => line.parseVariableNames(variablePattern, this));
	}

	private countNewLines(text : string)
	{
		let lineCount = 0;
		for(let i=1; i<text.length; i++)
			if (text.charAt(i-1) == "\n" || text.charAt(i-1) == "\r" && text.charAt(i) != "\n")
				lineCount++;
		return lineCount;
	}

	public createSourceTokenFromVariable(patternMatch: PatternMatch, sourceLine : SourceLine) : SourceToken
	{
		const firstLine = sourceLine.lineNumber;
		const lastLine = firstLine + this.countNewLines(patternMatch[0].match);

		const range = new Range(
			new Position( firstLine , patternMatch[0].start + 1 - this[firstLine].offset ),
			new Position( lastLine , patternMatch[0].end + 1 - this[lastLine].offset )
		);

		const sourceTokenType : SourceTokenType =
			VariablePatternMatch.hasMatchedDefinition(patternMatch) ? "declaration" :
			VariablePatternMatch.hasMatchedUse(patternMatch) ? "usage" : 
				"other" ;
		return [ range , patternMatch , sourceTokenType ];
	}
}
