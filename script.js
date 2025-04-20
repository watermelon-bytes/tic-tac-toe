//import React from 'react'

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
  })
  document.body.appendChild(playButton);
}

function setCellsCoordinates(i, n) {
  const letters = ['a', 'b', 'c', 'd'].reverse(); // Порядок изменён для правильного соответствия
  const numbers = [1, 2, 3, 4];
  
  // Вычисляем номер строки (от 0 до 3)
  const row = Math.floor((i - 1) / n); // -1 потому что i начинается с 1
  // Вычисляем номер столбца (от 0 до 3)
  const col = (i - 1) % n;
  
  // Проверяем, что индексы в пределах массива
  if (row >= letters.length || col >= numbers.length) {
    throw new Error('Invalid index: ' + i);
  }
  
  const coordinate = letters[row] + numbers[col];
  
  return coordinate;
}

class Sprite {
  constructor(image_style) {
    this.title = image_style;
    this.images_src = 'game_sprites/' + image_style + '/';
    this.x_src = this.images_src + 'crestick.png';
    this.o_src = this.images_src + 'zero.png';
  }
}

let gothic = new Sprite('gothic');
let classical = new Sprite('classical');

let square; // размер поля
function drawField(sideOfField) {

  // Создаем контейнер для игрового поля
  const gameContainer = document.createElement('div');
  gameContainer.setAttribute('id', 'game-field');
  gameContainer.setAttribute('class', 'game-container');
  document.body.appendChild(gameContainer);

  // Рассчитываем размеры ячеек
  const cellSize = Math.min(window.innerWidth, window.innerHeight) / (sideOfField + 1) / 1.5;

  // Создаем ячейки внутри контейнера
  for (let i = 1; i <= sideOfField ** 2; i++) {
    const cell = document.createElement('div');
    cell.setAttribute('class', 'cell');
    cell.setAttribute('id', setCellsCoordinates(i, 4));

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
  gameContainer.style.margin = '0 auto'; // Центрируем контейнер
}


let all_cells = () => document.querySelectorAll('.cell'); // функция querySelectorAll() возвращает статический список всех элементов с указанным в аргументе аттрибутами в контейнере,указанном перед точкой. 
let checkIsTurnPossible = (this_position) => (position[this_position] === null && !document.getElementById(this_position).hasChildNodes());
// проверяем, можно ли сделать ход в эту клетку

let player = null; // крестик = true, нолик = false. пока не выбрано, null.
let turn = true; // аналогично

let position = {};
square = 4; // размер поля по умолчанию

async function startToPlay() {
  player = null;
  turn = true;  // Всегда начинаем с крестиков
  position = {};

  document.getElementById('playbutton')?.remove(); // Удаляем кнопку "Play"
  document.getElementById('game-field')?.remove(); // Удаляем игровое поле, если оно есть

  for (let i = 1; i <= square ** 2; i++) {
    position[setCellsCoordinates(i, square)] = null;
  }

  console.log('Waiting for choice...');
  development_mode ? createTurnsLog() : null;

  let choice = await setChoice();
  console.log('Choice:', choice); // проверка
  drawField(Math.sqrt(Object.keys(position).length)); // Рисуем поле в зависимости от количества клеток в словаре
  cellEventListener();
}

let setChoice = function() {
  
  let createChoiceButton = function(id, text) {
    const button = document.createElement('button');
    button.setAttribute('id', id);
    
    button.textContent = text;
    button.addEventListener('click', () => {
      document.getElementById('container').remove();
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
            player = elem === 'x' ? true : false;
            resolve(player);
        });
      });
  });
}

let development_mode = true;
let default_style = classical; // по умолчанию классический стиль

function fillCell(cell_position, current_turn, chosen_style=default_style) {
  let side = document.createElement('img');

  if (current_turn) {
    side.setAttribute('src', chosen_style.x_src);
    side.alt = 'X';
  } else {
    side.setAttribute('src', chosen_style.o_src);
    side.alt = '0';
  }

  if (document.getElementById('turns_log')) {
    writeTurnDown(cell_position);
  }

  position[cell_position] = current_turn;
  document.getElementById(cell_position)?.appendChild(side);

  let winner = checkForWinner();
  if (winner !== null || checkForDraw(position)) {
    endCurrentGame(winner);
    return;
  }

  turn = !turn;
  player = !player;
  console.log("Ход игрока:", turn ? "X" : "O");
  console.log('Position:', position);
}

function cellEventListener() {
  all_cells().forEach(cell => {
    cell._clickHandler = function() {
      if (checkIsTurnPossible(this.id) && turn === player) {
        fillCell(this.id, turn);
      }
    };
    cell.addEventListener('mouseup', cell._clickHandler); 
    cell.addEventListener('load', cell._clickHandler); 
    cell.addEventListener('contextmenu', event => event.preventDefault());
  });
}


function checkForWinner() {
  function checkForWin(game_position, player_flag) {
    // Получаем все клетки текущего игрока
    const playerCells = Object.keys(game_position).filter(
      key => game_position[key] === player_flag
    );
    const letters = ['a', 'b', 'c', 'd'];
    const numbers = [1, 2, 3, 4];

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
    return (
      letters.every(char => stringOfCellIndeces.includes(char)) && 
      numbers.every(char => stringOfCellIndeces.includes(String(char)))
    );
      
  }

  return checkForWin(position, true) ?  'X wins!' : (checkForWin(position, false) ? 'O wins!' : null);
}

var checkForDraw = (this_position) => {
  const values = Object.values(this_position);
  if (values.every(cell => cell !== null) && checkForWinner() === null) {
    console.info('Draw!');
    return true;
  }
  return false;
}

function stylization(elem_id, type) {
  const btn_type = type === 'sec' ? 'btn-secondary' : 'btn-primary';
  const elem = document.getElementById(elem_id);
  if (elem) {
    elem.setAttribute('class', btn_type);
  } else {
    console.error(`Element with ID ${elem_id} not found`);
  }
}

async function endCurrentGame(winner) {
  all_cells().forEach(cell => {
    cell.removeEventListener('mouseup', cell._clickHandler);
  });

  if (winner !== null) {
    console.info(winner);
  } else {
    console.info('Draw!');
  }

  let _playAgainButton_ = document.createElement('button');
  _playAgainButton_.innerHTML = 'Play again?';
  _playAgainButton_.id = 'play_again_btn';
  
  
  let gameField = document.getElementById('game-field');
  let gameFieldRect = gameField.getBoundingClientRect();
  
  _playAgainButton_.style.position = 'absolute';
  _playAgainButton_.style.top = `${gameFieldRect.bottom + 10}px`;
  _playAgainButton_.style.left = `${gameFieldRect.left}px`;
  document.body.appendChild(_playAgainButton_);
  stylization('play_again_btn', 'prim');

  _playAgainButton_.addEventListener('click', () => {
    document.getElementById(_playAgainButton_.id).remove();
    document.getElementById('game-field')?.remove();
    startToPlay().catch(console.error);
  });
  
  console.info('Game over!');
}

var createTurnsLog = function() {
  let container = document.createElement('div');
  container.setAttribute('id', 'turns_log');
  container.setAttribute('position', 'absolute');
  document.body.appendChild(container);
}

var writeTurnDown = function(move) {
  let text = document.createElement('p');
  document.getElementById('turns_log').appendChild(text);

  text.innerHTML += JSON.stringify(position) + ", " + (turn ? '1' : '-1') + ", " + `\"${move}\"`;
  copyToClipboard(text.innerText);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Скопировано в буфер:', text);
    })
    .catch(err => {
      console.error('Ошибка копирования:', err);
    });
}

var makeRequest = () => {
  let data_about_our_game = {
    "position": position,
    "ml_player": !player,
  };

  let form = new XMLHttpRequest();

  let url = 'http://127.0.0.1:5000/move';
  form.open('POST', url);
  form.setRequestHeader('Content-Type', 'application/json');

  form.responseType = 'json';

  form.onload = () => {
    document.body.innerText = '';
    console.info('Response:', form.response);
    console.log('Status:', form.status);
    if (form.status === 200 && form.response?.cell) {
      fillCell(form.response.cell, !player);
    } else {
      console.error('Invalid response or request failed');
    }
  };

  form.onerror = () => {
    console.error('Request failed');
  };

  form.onploadstart = () => {
    document.body.innerText = 'Computer is thinking...';
  };
  try {
    form.send(JSON.stringify(data_about_our_game));
  } catch (e) {
    console.error('Error:', e);
  }
}

var computer_turn = function() {
  let cell = makeRequest();
  try {
    fillCell(cell, !turn);
  } catch (e) {
    console.error('Error:', e);
  }
}