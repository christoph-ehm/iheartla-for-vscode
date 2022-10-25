import PCRE from '@stephen-riley/pcre2-wasm';  // no official TS support, therefore no type inference

export interface CaptureMatchName
{
	[capture: string ] : { start: number, end: number, match: string, group: number, name: string }
}
export interface CaptureMatchNumber
{
	[capture: number ] : { start: number, end: number, match: string }
}
export type PatternMatch = { length: number } & CaptureMatchName & CaptureMatchNumber;

var isPCREInitialized = false;
async function initializePCRE2 ()
{
	if (isPCREInitialized) return;

	isPCREInitialized = true;
	await PCRE.init();
}
initializePCRE2();
