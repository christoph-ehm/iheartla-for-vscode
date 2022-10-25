import * as vscode from 'vscode';
import PCRE from '@stephen-riley/pcre2-wasm';
import { PatternMatch } from './InitalizePCRE';

import { AlolaAPI } from './extension';
import { SourceLineArray, SourceToken, SourceTokenType, _sourceTokenTypes } from './SourceLineArray';

// my naming convention only uses a `_` prefix for global (exported) variables unless an initial Capital letter for Type name is used

export const _alolaTokenTypes = [
	"variable" ,
	"function" ,
	"keyword" ,
	"type" ,
	"parameter" ,
	"operator",
] as const;

export type AlolaTokenType = (typeof _alolaTokenTypes)[keyof typeof _alolaTokenTypes];

export const _alolaTokenModifiers = [
	"declaration" ,
	"definition" ,
	"readonly" ,
	"deprecated" ,
	"modification" ,
	"defaultLibrary",
] as const;

export type AlolaTokenModifier = (typeof _alolaTokenModifiers)[keyof typeof _alolaTokenModifiers];

export type SemanticToken = [ range: vscode.Range, tokenType: string, tokenModifiers?: string[] ];

// avoid `static` variables when possible, for improved maintenance so that all members can be accessed via `this`

class _VariablePatternMatch
{
	private readonly definitionGroupName = "decl";
	private readonly usageGroupName = "use";
	private readonly definedVariablesGroupName = "vars";

	public hasMatchedDefinition = (patternMatch : PatternMatch) =>
		!!patternMatch[this.definitionGroupName];
	public hasMatchedUse = (patternMatch : PatternMatch) =>
		!!patternMatch[this.usageGroupName];

	/**
	The reason for why PCRE is returned and not managed in the class is simply JavaScript's/TypeScript's lack of memory management support.
	There is no way to automatically destroy the PCRE object when it is collected. So best is to not burden developers with
	the need of destroyinng another class explicitly. Keep explicitly managed classes to a minimum. (It kills OOP in this case.)
	I am not going to import a package or implement for such a basic language functionality which serious OOP languages have by default.
	*/
	public createVariablePattern(definedVariableNames : string[]) : PCRE
	{
		return new PCRE(String.raw`
				(?<${this.definitionGroupName}> ${ this.variableDeclarationPatternString }) |
				(?<${this.usageGroupName}> ${ this.definedVariablePattern(definedVariableNames) })
				`, 'x');
	}

	private readonly wordCharacter = String.raw`[\p{Ll}\p{Lu}\p{Lo}\p{M}]`;
	private readonly excludedKeywords = String.raw`
		(?<!${this.wordCharacter}) (?:
			(?:where|given|from)
			(?!${this.wordCharacter})
			|
			(?:sum|int|(?:arg)?(?:max|min))
			(?=_)
		)
	`;

	// TODO: the type pattern is bad, hard-coded
	private readonly variableDeclarationPatternString = String.raw`
			(?: (?<= [;\f\r\n] ) | ^ )
			(?<${this.definedVariablesGroupName}> (?>
				(?! ${this.excludedKeywords} ) [^;:∈\f\r\n${"`"}∑∫{=] |
				${"`"}[^${"`"}]*${"`"} ,?
			)+ ) (
				∈ |
				: [ \t]* (?= [ℝℤ{∅] | \b matrix \b | \b vector \b | \b scalar \b | (?=[;\f\r\n]|$) )
			)`;

	public readonly variableDeclarationPattern = new PCRE(this.variableDeclarationPatternString, 'x');

	private definedVariablePattern(definedVariableNames : string[])
	{
		return String.raw`
				(?= (?=\p{L})[\p{Ll}\p{Lu}\p{Lo}\p{M}\d]+ | ${"`"} )
				(${"`"})? (${ definedVariableNames.join("|") }) (?(-2)${"`"})
		`;
	}

	public extractDefinedVariables(patternMatch : PatternMatch)
	{
		const variableNames = patternMatch[this.definedVariablesGroupName]?.match;
		return !!variableNames? this.splitVariableList(variableNames) : [];
	}

	/**
	Splits comma separated variable names into an array of variable name strings.
	Some commas are part of the variable and must not be split:
	* ignore every comma inside pairs of backticks
	* ignore comma after underscore and before the following non-variable charactere
	*/
	private splitVariableList(variableList : string) : string[]
	{
		let resultVariables = [variableList]

		const quotedVariableName = (name : string) => `\\Q${name.trim()}\\E`;

		let isInsideOfBackticks = false;
		let isAfterUnderscore = false;
		let hasFoundCommaBefore = false;
		let pastCommaIndex = 0;
		let index = 0;
		for(const currentCharacter of variableList)
		{
			isInsideOfBackticks = (isInsideOfBackticks != (currentCharacter == '`'));
			isAfterUnderscore ||= (currentCharacter == '_');  // is it actually the case that declared variables don't contain `_`??
			isAfterUnderscore &&=! (currentCharacter == ' ');

			if (hasFoundCommaBefore && !isAfterUnderscore && !isInsideOfBackticks)
			{
				resultVariables.pop();  //does not pop after last string was pushed
				resultVariables.push( quotedVariableName(variableList.substring(pastCommaIndex, pastCommaIndex = index-1)) );
				resultVariables.push(variableList.substring(index));
			}

			hasFoundCommaBefore = (currentCharacter == ',');  //at this place it has a lookbehind effect
			index++;
		}

		(function trimLastVariableName ()
		{
			resultVariables.push( quotedVariableName(resultVariables.pop()!) );
		})();
		return resultVariables;
	}
}
export const VariablePatternMatch = new _VariablePatternMatch();  //prevents `static`


type TokenColourEntry = { index: number; colors: TokenColour[] };
type TokenColour = [ string /*tokenType*/ , string[] /*tokenModifier*/ ];
class TokenColourMap
{
	private readonly currentColourMap : Map<SourceTokenType, TokenColourEntry>;

	constructor()
	{
		this.currentColourMap = new Map<SourceTokenType, TokenColourEntry>([
			["declaration",
				{ index: 0, colors: [
						[ "function", ["declaration"] ] ,
						[ "function", ["readonly"] ] ,
						[ "function", ["defaultLibrary"] ]
					] }],
			["usage",
				{ index: 0, colors: [
						[ "variable", ["declaration"] ] ,
						[ "variable", ["readonly"] ] ,
						[ "variable", ["defaultLibrary"] ]
					] }],
			["other",
				{ index: 0, colors: [
						[ "parameter", ["declaration"] ] ,
						[ "parameter", ["readonly"] ] ,
						[ "parameter", ["defaultLibrary"] ]
					] }],
		]);
	}

	public getColorOf(tokenType: SourceTokenType) : TokenColour
	{
		const tokenColour = this.currentColourMap.get(tokenType);
		const resultColor = tokenColour?.colors[tokenColour?.index] ?? [ "" , [] ];

		if (!!tokenColour && ++tokenColour.index >= tokenColour.colors.length)
			tokenColour.index = 0;

		return resultColor;
	}
}

export class AlolaTokenParser implements vscode.DocumentSemanticTokensProvider,  AlolaAPI
{
	private readonly sourceSelectionToParse: vscode.DocumentSelector =
	{
		language: 'alola' /* languageId from package.json */ ,
		scheme: 'file' /*from local filesystem*/
	};

	public activateFor(myExtension: vscode.ExtensionContext)
	{
		const registerTokenParser = vscode.languages.registerDocumentSemanticTokensProvider;
		const tokenParserLife : vscode.Disposable =
				registerTokenParser(this.sourceSelectionToParse, this, this.tokenLegend);
	
		myExtension.subscriptions.push(tokenParserLife);
	}

	constructor(private tokenLegend : vscode.SemanticTokensLegend)
	{ }

	/** converts all parsed tokens into a builder */
	async provideDocumentSemanticTokens( document: vscode.TextDocument , token: vscode.CancellationToken )
		: Promise<vscode.SemanticTokens>
	{
		const tokenCollection = new vscode.SemanticTokensBuilder(this.tokenLegend);
		this.parseTokensFrom(document.getText(), tokenCollection);

		return tokenCollection.build();
	}

	private parseTokensFrom(text : string, parsedTokens : vscode.SemanticTokensBuilder)
	{
		const currentlyDefinedVariableNames = this.parseAllDefinedVariableNames(text);
		// TODO optional, push extra variable definition tokens from library imports

		const definedVariablePattern = VariablePatternMatch.createVariablePattern(currentlyDefinedVariableNames);
		
		const sourceLines = new SourceLineArray(text);
		const foundVariablePatterns = sourceLines.parseVariableNames(definedVariablePattern);

		const colouredVariableTokens = this.colorizeVariableNames(foundVariablePatterns);

		colouredVariableTokens.forEach(semanticToken =>  parsedTokens.push(...semanticToken)  );

		definedVariablePattern.destroy();
	}

	private readonly tokenColourMap = new TokenColourMap();

	/// distinguishes colorization based on sourceTokenType
	private colorizeVariableNames(foundVariablePatterns : SourceToken[]) : SemanticToken[]
	{
		const newSemanticToken = (sourceToken : SourceToken) : SemanticToken =>
		[
			sourceToken[0],
			...this.tokenColourMap.getColorOf(sourceToken[2])
		];

		return foundVariablePatterns.map(newSemanticToken);
	}

	private parseAllDefinedVariableNames(text : string) : string[]
	{
		const foundDefinitionStrings : PatternMatch[] = VariablePatternMatch.variableDeclarationPattern.matchAll(text, 0);

		const foundVariableNames = foundDefinitionStrings.flatMap(VariablePatternMatch.extractDefinedVariables);
		return foundVariableNames;
	}

}
