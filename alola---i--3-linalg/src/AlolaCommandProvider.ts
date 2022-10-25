import * as vscode from 'vscode';

import { Snippeteer } from './Snippeteer';
import { AlolaAPI } from './extension';


export type AlolaCommand = [ commandName : string, commandCode: ( ...args: any[]) => any ];
export type AlolaCommandUnbound = [ commandName : string, commandCode: ( self : AlolaCommandProvider, ...args: any[]) => any ];

export class AlolaCommandProvider extends Array<AlolaCommand> implements AlolaAPI
{
	readonly defaultOutputLanguage = "numpy";

	constructor(readonly snippetProvider : Snippeteer, ...commands: AlolaCommandUnbound[])
	{
		super(
			...commands.map(([name, code]) =>  <AlolaCommand>[name, code.bind(null, this)] )
		);
	}

	public iheartlaOutputOption()
	{

	}

	public activateFor(theExtension: vscode.ExtensionContext)
	{
		for (const command of this)
		{
			const commandLife = vscode.commands.registerCommand(...command);
			theExtension.subscriptions.push(commandLife);
		}
	}
}