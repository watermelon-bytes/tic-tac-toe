// короче, надо всё это переделывать
// классы не доделаны, много лишних ненужных функций
// в общем,ужас
/*
window.onload = () => {
  const playButton = document.createElement('button');
  playButton.setAttribute('id', 'playbutton');
  playButton.textContent = 'Play';
  playButton.setAttribute('class', 'btn-primary');
  playButton.style.position = 'absolute';
  playButton.style.top = '50%';
  playButton.style.left = '50%';
  playButton.style.transform = 'translate(-50%, -50%)';
  playButton.addEventListener('click', () => {
      startToPlay().catch(console.error);
    }
  );

  document.body.appendChild(playButton);
}

function setCellsCoordinates(i: number, n: number): string {
  const letters = ['a', 'b', 'c', 'd'];
  const numbers = [1, 2, 3, 4].reverse();

  const col = Math.floor((i - 1) / n);
  const row = (i - 1) % n;

  if (row >= letters.length || col >= numbers.length) {
      throw new Error('Invalid index: ' + i);
  }

  const coordinate = letters[row] + numbers[col];

  return coordinate;
}

class Sprite {
  title: string;
  images_src: string;
  x_src: string;
  o_src: string;
  constructor(image_style: string) {
      this.title = image_style;
      this.images_src = 'static/game_sprites/' + image_style + '/';
      this.x_src = this.images_src + 'crestick.png';
      this.o_src = this.images_src + 'zero.png';
  }
}

class Game {
  session_id: string;
  client_side: string;
  position: {[key: string]: boolean | null};
  sideOfField: number;
  current_turn: boolean = true;

  constructor(client_side: boolean) {
    this.client_side = client_side === true ? 'x' : 'o';
    this.position = {};
  }

  async start() {
    let session_request = await fetch('/new_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ first_move: this.client_side === 'x' ? 'clent' : 'server', client_side: this.client_side})
    });
  
    if (session_request.ok) {
        var result = await session_request.json();
        return result.session_id;
      } else {
        throw new Error("Cannot create a session now. Try later.")
    }
  };

  isValidMove(move: string): boolean {
    return this.position[move] === null;
  }



  turn(target: Cell): void {
    if (this.isValidMove(target.id)) {
      target.drawCell(this);
      this.current_turn = !this.current_turn;
    }
  }
}


class Cell {
  id: string;
  queue_number: number;
  value: boolean | null;
  elem: Element;
  classname: Sprite;

  constructor(sequence_number: number) {
    this.id = setCellsCoordinates(sequence_number, 4);
    this.value = null;
    this.elem = document.createElement('div');
    this.elem.setAttribute('id', this.id);
    this.elem.setAttribute('class', this.classname.title);
  }

  clickHandler(game: Game) {
    if (checkIsTurnPossible(this.id)) {
      fetch('/game', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
              session_id: game.session_id,
              move: this.id,
          })
        }
      ).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        var data = response.json();
        game.fillCell(this.id, player); // Делаем ход
        fillCell(data['move'], !player); // Делаем ход
        

      }, rejected => {
        console.error('Error:', rejected);
      })
    }
  }

  setNecessaryEventListener(game: Game): void {
    this.elem.addEventListener("onclick", this.clickHandler);
  }

  drawCell(game: Game) {
    
    let cellElement: Cell;
    const cellSize = Math.min(window.innerWidth, window.innerHeight) / (game.sideOfField + 1) / 1.5;

    for (let i: number = 0; i > 9; i++) {
      cellElement = new Cell(i);
      document.appendChild(cellElement.elem);
    }
     
  }
  
  fillCell(game: Game, chosen_style: Sprite = classical): void {
    let side = document.createElement('img');
  
    if (game.current_turn === true) {
        side.setAttribute('src', chosen_style.x_src);
        side.alt = 'X';
    } else {
        side.setAttribute('src', chosen_style.o_src);
        side.alt = '0';
    }
  
    if (document.getElementById('turns_log')) {
        writeTurnDown(this.id);
    }
  
    game.position[this.id] = game.current_turn;
    document.getElementById(this.id)?.appendChild(this.elem);
  
    let winner = checkForWinner();
    if (winner !== null || checkForDraw(position)) {
        endCurrentGame(winner);
        return;
    }
  
    game.current_turn = !game.current_turn;

    console.log("Ход игрока:", game.current_turn ? "X": "O");
    console.log('Position:', position);
  }

}

let gothic = new Sprite('gothic');
let classical = new Sprite('classical');

let square: number;

function drawField(sideOfField: number): void {
  const gameContainer = document.createElement('div');
  gameContainer.setAttribute('id', 'game-field');
  gameContainer.setAttribute('class', 'game-container');
  document.body.appendChild(gameContainer);

  const cellSize = Math.min(window.innerWidth, window.innerHeight) / (sideOfField + 1) / 1.5;

  for (let i = 1; i <= sideOfField ** 2; i++) {
      const cell = document.createElement('div');
      cell.setAttribute('class', 'cell');
      cell.setAttribute('id', setCellsCoordinates(i, sideOfField));

      const row = Math.ceil(i / sideOfField);
      const column = (i - 1) % sideOfField + 1;

      cell.style.position = 'absolute';
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      cell.style.top = `${(row - 1) * cellSize}px`;
      cell.style.left = `${(column - 1) * cellSize}px`;

      gameContainer.appendChild(cell);
  }

  square = sideOfField;
  gameContainer.style.position = 'relative';
  gameContainer.style.width = `${cellSize * sideOfField}px`;
  gameContainer.style.height = `${cellSize * sideOfField}px`;
  gameContainer.style.margin = '0 auto';
}

let all_cells = () => document.querySelectorAll('.cell');


var player: boolean;

let turn = true;
let position = {};
var session_id: string;
square = 4;

async function startToPlay() {
  turn = true;
  position = {};

  document.getElementById('playbutton')?.remove();
  document.getElementById('game-field')?.remove();

  for (let i = 1; i <= square ** 2; i++) {
      position[setCellsCoordinates(i, square)] = null;
  }

  console.log('Waiting for choice...');
  development_mode ? createTurnsLog() : null;

  let choice = await setChoice();
  session_id = await start_session(choice === true ? 'x' : 'o'); // Дождаться получения session_id

  console.log('Choice:', choice);
  drawField(Math.sqrt(Object.keys(position).length));
  cellEventListener();
}

let setChoice = function(): any {
  let createChoiceButton = function(id: string, text: string) {
      const button = document.createElement('button');
      button.setAttribute('id', id);
      button.textContent = text;
      button.addEventListener('click', () => {
          document.getElementById('container')?.remove();
      });
      return button;
  }

  return new Promise((resolve) => {
      const container = document.createElement('div');
      container.setAttribute('id', 'container');
      document.body.appendChild(container);

      const promptText = 'Play as ';

      ['x', 'o'].forEach((elem) => {
          let button = createChoiceButton(`${elem}_btn`, promptText + elem.toUpperCase());
          container.appendChild(button);
          stylization(button.id, 'sec');
          button.addEventListener('click', () => {
              player = (elem === 'x' ? true: false);
              resolve(player);
          });
      });
  });
}

let development_mode = false;



function cellEventListener(): void {
  all_cells().forEach(cell => {
      cell.addEventListener('click', function() {
          if (checkIsTurnPossible(this.id)) {
              fetch('/game', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json;charset=utf-8'
                  },
                  body: JSON.stringify({
                      session_id: session_id,
                      move: this.id,
                  })
                }

              ).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                var data = response.json();
                fillCell(this.id, player); // Делаем ход
                fillCell(data['move'], !player); // Делаем ход
                

              }, rejected => {
                console.error('Error:', rejected);
              }) // Возвращаем Promise;
              //fillCell(this.id, player === null ? turn : player); // Делаем ход
          }
      });
      cell.addEventListener('contextmenu', event => event.preventDefault());
  });
}

function checkForWinner(): any {
  function checkForWin(game_position: {[key: string]: any}, player_flag: boolean): boolean {
      const playerCells = Object.keys(game_position).filter(key => game_position[key] === player_flag);
      const letters = ['a', 'b', 'c', 'd'];
      const numbers = ["1", "2", "3", "4"];

      for (let letter of letters) {
          if (numbers.every(number => playerCells.includes(letter + number))) {
              return true;
          }
      }

      for (let number of numbers) {
          if (letters.every(letter => playerCells.includes(letter + number))) {
              return true;
          }
      }

      let stringOfCellIndeces = playerCells.join("");
      return (letters.every(char => stringOfCellIndeces.includes(char)) && numbers.every(char => stringOfCellIndeces.includes(String(char))));
  }

  return checkForWin(position, true) ? 'X wins!': (checkForWin(position, false) ? 'O wins!': null);
}

var checkForDraw = (this_position: {[key: string]: any}) => {
  const values = Object.values(this_position);
  if (values.every(cell => cell !== null) && checkForWinner() === null) {
      console.info('Draw!');
      return true;
  }
  return false;
}

function stylization(elem_id: string, type: string): void {
  const btn_type = type === 'sec' ? 'btn-secondary': 'btn-primary';
  const elem = document.getElementById(elem_id);
  if (elem) {
      elem.setAttribute('class', btn_type);
  } else {
      console.error(`Element with ID ${elem_id} not found`);
  }
}

async function endCurrentGame(winner: boolean) {
  all_cells().forEach(cell => {
      cell.removeEventListener('click', cell.clickHandler); // Удаляем обработчик 'click'
  });

  winner !== null ? console.info(winner) : console.info('Draw!');

  let _playAgainButton_ = document.createElement('button');
  _playAgainButton_.innerHTML = 'Play again?';
  _playAgainButton_.id = 'play_again_btn';

  let gameField = document.getElementById('game-field');
  let gameFieldRect = gameField?.getBoundingClientRect();

  _playAgainButton_.style.position = 'absolute';
  _playAgainButton_.style.top = `${gameFieldRect ? gameFieldRect.bottom + 10 : 0}px`;
  _playAgainButton_.style.left = `${gameFieldRect?.left}px`;
  document.body.appendChild(_playAgainButton_);
  stylization('play_again_btn', 'prim');

  _playAgainButton_.addEventListener('click', () =>  {
      document.getElementById('play_again_btn')?.remove();
      document.getElementById('game-field')?.remove();
      startToPlay().catch(console.error);
  });

  console.info('Game over!');
}

var createTurnsLog = function(): void {
  let container = document.createElement('div');
  container.setAttribute('id', 'turns_log');
  container.setAttribute('position', 'absolute');
  document.body.appendChild(container);
}

var writeTurnDown = function(move: string) {
  let text = document.createElement('p');
  document.getElementById('turns_log')?.appendChild(text);
  text.innerHTML += JSON.stringify(position) + ", " + (turn ? '1': '-1') + ", " + `\"${move}\"`;
}

var makeRequest = async function(session_id: string, turnMade: string) {
  let data_about_our_game = {
    session_id: session_id,
    turn: turnMade
  };

  let request = await fetch('/game', {
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    method: 'POST',
    body: JSON.stringify(data_about_our_game)
    });

  return request.ok ? await request.json() : request.statusText; // Дождаться JSON при успехе
}

var computer_turn = async function(session_id: string, turn: string) {
  let cell = await makeRequest(session_id, turn);
  try {
    fillCell(cell, !turn);
  } catch (e) {
    console.error('Error:', e);
  }
}

var start_session = async function(client_piece: string) {
  let session_request = await fetch('/new_session', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ first_move: client_piece === 'x' ? 'clent' : 'server', client_side: client_piece})
  });

  if (session_request.ok) {
      var result = await session_request.json(); // Дождаться и вернуть JSON
      return result.session_id;
    } else {
      return { "error": "Cannot create a session now. Try later." };
  }
};*/


// main.ts (или index.ts)
// ... (GameTheme, Cell, Game классы в отдельных файлах, если используешь модули)

// Глобальная функция для установки координат (может быть в utils.ts)

import Game from "./game";
import {gothic, classical} from "./utils";

// Инициализация игры при загрузке страницы
let gameInstance: Game;

window.onload = () => {
  // Создаем экземпляр игры (можно передать тему и размер поля)
  gameInstance = new Game(4, classical);

  const playButton = document.createElement('button');
  playButton.setAttribute('id', 'playbutton');
  playButton.textContent = 'Play';
  playButton.setAttribute('class', 'btn-primary');
  playButton.style.position = 'absolute';
  playButton.style.top = '50%';
  playButton.style.left = '50%';
  playButton.style.transform = 'translate(-50%, -50%)';
  playButton.addEventListener('click', () => {
      gameInstance.startGame().catch(console.error); // Запускаем игру через метод объекта Game
  });

  document.body.appendChild(playButton);
}