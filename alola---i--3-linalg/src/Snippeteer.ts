import * as vscode from 'vscode';
import * as path from 'path';

export const _alolaLibrary = [
		"eigen" , "numpy" , "matlab" , "latex"
] as const;

export type AlolaLibrary = (typeof _alolaLibrary)[keyof typeof _alolaLibrary];

// cuts out and compiles code sippets which were generated from I❤️LA files
class _Snippeteer
{
	public readonly standardFileExtension = ".lina";

	public readonly iheartlaPath? : string =
			vscode.workspace.getConfiguration().get("iheartla.path") ??
					void vscode.window.showErrorMessage(
						"Could not access setting \"iheartla.path\" in the settings.json.\n"+
						"Compilation needs to contain the file path to the iheartla compiler executable."
					);

	public getSnippet(library : AlolaLibrary, filePath? : string) : string
	{

	}

	public getDerivedFilePath(fromFilePath : string, withExtension : string = Snippeteer.standardFileExtension)
	{
		return path.join(path.dirname(fromFilePath), path.basename(fromFilePath, path.extname(fromFilePath)) + withExtension);
	}
}
export const Snippeteer = new _Snippeteer();