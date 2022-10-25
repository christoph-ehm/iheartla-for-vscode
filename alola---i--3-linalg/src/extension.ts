import * as vscode from 'vscode';
import {
	_alolaTokenTypes,
	_alolaTokenModifiers,
	AlolaTokenParser,
} from './AlolaTokenParser';
import { Snippeteer, AlolaLibrary } from './Snippeteer';
import { AlolaCommandProvider } from './AlolaCommandProvider';

class Alola
{
	static readonly tokenLegend = new vscode.SemanticTokensLegend(_alolaTokenTypes.slice(), _alolaTokenModifiers.slice());
	static readonly tokenParser = new AlolaTokenParser(this.tokenLegend);
	static readonly commands =  new AlolaCommandProvider(
		new Snippeteer(),
		[
			/** Calls the iheartla compiler with the file of the given path or the currently opened file.
				Calls the compiler/interpeter on the output. */
			'alola.compileCurrentFile',
			function(self : AlolaCommandProvider, filePath?: string)
			{
				
				self.snippetProvider;
			}
		],
		[
			/** Calls the iheartla compiler on a file (or current) file. Cuts out the function from the output. 
				Rearranges it and copies it into clipboard. */
			'alola.compileToClipboard',
			function(self : AlolaCommandProvider, library: AlolaLibrary, filePath?: string)
			{
				vscode.env.clipboard.writeText( self.snippetProvider.getSnippet(library, filePath) );
			}
		],
		[
			/** Iheartla compiles the current or otherwise selected to C++ source code
				and tries to compile it to a shared library.*/
			'alola.compileToSharedLibrary',
			function(self : AlolaCommandProvider, filePath?: string)
			{
				self.snippetProvider.getSnippet("eigen", filePath);
			}
		]
	);
}

export interface AlolaAPI
{
	activateFor(myExtension: vscode.ExtensionContext) : void;
}

export function activate(myExtension: vscode.ExtensionContext)
{
	const api : { [apiName: string]: AlolaAPI }  =
	{
		tokenParser: Alola.tokenParser,
		commands: Alola.commands
	};

	for (const apiPart in api)
	{
		api[apiPart].activateFor(myExtension);
	}

	return api;
}
