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
export function createPlayButton(): void {
    let playButton = document.createElement('button');
    playButton.setAttribute('id', 'playbutton');
    playButton.textContent = 'Play';
    playButton.setAttribute('class', 'btn-primary');
    playButton.style.position = 'absolute';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(playButton);
    return;
}


export function setCellsCoordinates(i: number, n: number = 3): string {
    if (n <= 2) throw new Error('Invalid grid size: ' + n + '. It must be at least 2.');

    let letters: string[] = [];
    for (let j = 0; j < n; j++) {
        letters.push(String.fromCharCode(97 + j)); // 'a' is 97 in ASCII
    }

    const numbers: string[] = [];
    for (let j = 1; j <= n; j++) {
        numbers.push(j.toString());
    }
  
    const col = Math.floor((i - 1) / n);
    const row = (i - 1) % n;
  
    if (row >= letters.length || col >= numbers.length) throw new Error('Invalid index: ' + i);
  
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