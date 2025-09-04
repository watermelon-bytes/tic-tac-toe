import * as utils from "./utils.js";
import { Cell } from "./cell.js";
declare type GameTheme = utils.GameTheme;
declare type GameSymbol = 'x' | 'o';
declare type GameResult = 'x' | 'o' | 'draw' | null;
export default class Game {
    session_id: string | null;
    playerSymbol: GameSymbol | null;
    position: {
        [coordinate: string]: GameSymbol | null;
    };
    currentTurn: GameSymbol;
    sideOfField: number;
    cells: Cell[];
    gameContainer: HTMLDivElement | null;
    gameTheme: GameTheme;
    private turnsLogContainer;
    constructor(initialSide?: number, theme?: GameTheme);
    initializeSession(): Promise<any>;
    makeMove(cellId: string): Promise<void>;
    isValidMove(move: string): boolean;
    drawField(): void;
    checkForWinner(): GameResult;
    checkForDraw(): boolean;
    endGame(winner: GameResult): void;
    private choosePlayerSymbol;
    startGame(): Promise<void>;
    private createTurnsLog;
    private logTurn;
}
export {};
