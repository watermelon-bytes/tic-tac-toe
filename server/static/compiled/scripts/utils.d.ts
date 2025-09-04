export declare class GameTheme {
    title: string;
    images_src: string;
    x_src: string;
    o_src: string;
    constructor(themeName: string);
}
export declare function createPlayButton(): void;
export declare function setCellsCoordinates(i: number, n?: number): string;
export declare function stylization(elem_id: string, type: string, element?: HTMLElement): void;
export declare const classical: GameTheme;
export declare const gothic: GameTheme;
