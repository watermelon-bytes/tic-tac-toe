// Here we define the necessary functions and classes used in the game

export class GameTheme {
    title: string;
    images_src: string;
    x_src: string;
    o_src: string;

    constructor(themeName: string) {
        this.title = themeName;
        this.images_src = `static/game_sprites/${themeName}/`;
        this.x_src = `${this.images_src}crestick.png`;
        this.o_src = `${this.images_src}zero.png`;
    }
}

/*------------------GLOBAL EXPORTED FUNCTIONS-----------------------*/

export function setCellsCoordinates(i: number, n: number): string {
    const letters = ['a', 'b', 'c', 'd'];
    const numbers = ['1', '2', '3', '4'];
  
    const col = Math.floor((i - 1) / n);
    const row = (i - 1) % n;
  
    if (row >= letters.length || col >= numbers.length) {
        throw new Error('Invalid index: ' + i);
    }
  
    const coordinate = letters[row] + numbers[col];
    return coordinate;
}

export function stylization(elem_id: string, type: string, element?: HTMLElement): void {
  const btn_type = type === 'sec' ? 'btn-secondary' : 'btn-primary';
  const elem = element || document.getElementById(elem_id); // Используем переданный элемент, если есть
  if (elem) {
      elem.setAttribute('class', btn_type);
  } else {
      console.error(`Element with ID ${elem_id} not found`);
  }
}
/*-------------------------------------------------------------------*/


/* --------------------------THEMES-------------------- */
export const classical: GameTheme = new GameTheme('classical');
export const gothic: GameTheme = new GameTheme('gothic');
/* ---------------------------------------------------- */