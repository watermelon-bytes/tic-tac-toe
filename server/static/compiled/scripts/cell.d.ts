import { GameTheme } from "./utils.js";
declare type PlayerSymbol = 'x' | 'o';
export declare class Cell {
    readonly coordinate: string;
    private _value;
    element: HTMLDivElement;
    private theme;
    constructor(sequence_number: number, sideOfField: number, theme?: GameTheme);
    get value(): PlayerSymbol | null;
    draw(cellSize: number, row: number, column: number): void;
    fill(symbol: PlayerSymbol): void;
    clear(): void;
}
export {};
