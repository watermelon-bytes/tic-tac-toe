let onload_starting = () => {
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

window.load = onload_starting();

function setCellsCoordinates(i) { // здесь мы по цифре i вычисляем координаты ячейки
  let coordinate = '';
  switch (Math.ceil(i / 3)) {
    case 1:
      coordinate += 'c';
      break;
    case 2:
      coordinate += 'b';
      break;
    case 3: 
      coordinate += 'a';
      break;
  }
  switch (i % 3) {
    case 1:
      coordinate += '3';
      break;
    case 2:
      coordinate += '2';
      break;
    case 0:
      coordinate += '1';
      break;
  }
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
    cell.setAttribute('id', setCellsCoordinates(i));

    const row = Math.ceil(i / sideOfField);
    const column = (i - 1) % sideOfField + 1;

    cell.style.position = 'absolute';
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    cell.style.top = `${(row - 1) * cellSize}px`;
    cell.style.left = `${(column - 1) * cellSize}px`;

    gameContainer.appendChild(cell);
  }
  gameContainer.style.position = 'relative';
  gameContainer.style.width = `${cellSize * sideOfField}px`;
  gameContainer.style.height = `${cellSize * sideOfField}px`;
  gameContainer.style.margin = '0 auto'; // Центрируем контейнер
}

let tryToRemove = function(button_id) {
  if (document.getElementById(button_id)) {
    document.getElementById(button_id).remove();
  }
}

let all_cells = () => document.querySelectorAll('.cell'); // функция querySelectorAll()ё возвращает статический список всех элементов с указанным в аргументе аттрибутами в контейнере,указанном перед точкой. 
let checkIsTurnPossible = (this_position) => (position[this_position] === null && !document.getElementById(this_position).hasChildNodes());
// проверяем, можно ли сделать ход в эту клетку


let player = null; // крестик = true, нолик = false. пока не выбрано, null.
let turn = true; // аналогично
let position = {};

async function startToPlay() {
  player = null;
  turn = true;  // Всегда начинаем с крестиков
  tryToRemove('playbutton');

  all_cells().forEach(cell => {
    cell.remove()
  });
  

  for (let i = 1; i < 10; i++) {
    position[setCellsCoordinates(i)] = null;
  }

  console.log('Waiting for choice...');
  if (development_mode) {
    create_turns_log();
  }

  let choice = await setChoice();
  console.log('Choice:', choice); // проверка
  drawField(3);
  cellEventListener();
}

let setChoice = function() {
  let createChoiceButton = function(id, text) {
    const button = document.createElement('button');
    button.setAttribute('id', id);
    stylization(id, 'sec');
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
    container.appendChild(createChoiceButton('x_btn', promptText + 'X')).addEventListener('click', () => {
      player = true;
      resolve(true);
    });

    container.appendChild(createChoiceButton('o_btn', promptText + 'O')).addEventListener('click', () => {
      player = false;
      resolve(false);
    });
  });
}

let development_mode = false

function fillCell(cell_position, current_turn) {
  let side = document.createElement('img');
  let the_cell = document.getElementById(cell_position);

  if (current_turn) { 
    side.setAttribute('src', gothic.x_src);
    side.alt = 'X';
  } else {
    side.setAttribute('src', gothic.o_src);
    side.alt = '0';
  }

  if (document.getElementById('turns_log')) {
    write_turn_down(cell_position);
  }

  position[cell_position] = current_turn;
  the_cell.appendChild(side);

  let winner = checkForWinner();
  if (winner !== null || checkForDraw(position)) {
    endCurrentGame(winner);
    return;
  }

  // Меняем ход только если игра не закончена
  turn = !turn;
  console.log("Ход игрока:", turn ? "X" : "O");
  console.log('Position:', position);
}


/*function handler(object) {
  if (object.hasChildNodes() === false) { // проверка на дочерние узлы 
    fillCell(object.id, turn); // здесь мы через cell.id будем получать координаты клетки
  }
}*/

function cellEventListener() {
  all_cells().forEach(cell => { // здесь cell - это название переменной, которая будет принимать значение каждой клетки

    cell._clickHandler = () => {
      if (checkIsTurnPossible(cell.id)) {
        fillCell(cell.id, turn);
      }
    }
    cell.addEventListener('mouseup', cell._clickHandler);
  });
}


function checkForWinner() {
  function checkForWin(game_position, player_flag) {
    // Получаем все клетки текущего игрока
    const playerCells = Object.keys(game_position).filter(
      key => game_position[key] === player_flag
    );
    const letters = ['a', 'b', 'c'];
    const numbers = [1, 2, 3];

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

    const diagonals = [['a1', 'b2', 'c3'], ['a3', 'b2', 'c1']];
    return diagonals.some( diagonal => diagonal.every(cell => playerCells.includes(cell)) ) ? true : false;
  }

  if (checkForWin(position, true)) {
    return 'X wins!';
  } else if (checkForWin(position, false)) {
    return 'O wins!';
  }
  return null;
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
  let btn_type;
  switch (type.slice(0, 3)) {
    case 'pri':
      btn_type = 'btn-primary';
      break;
    case 'sec':
      btn_type = 'btn-secondary';
      break;
    default:
      btn_type = 'btn-primary';
  }

  try {
    elem = document.getElementById(elem_id);
    elem.setAttribute('class', btn_type);
  } catch (e) {
    console.error(e);
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
  _playAgainButton_.setAttribute('id', 'play_again_btn');
  stylization('play_again_btn', 'prim');
  
  let gameField = document.getElementById('game-field');
  let gameFieldRect = gameField.getBoundingClientRect();
  
  _playAgainButton_.style.position = 'absolute';
  _playAgainButton_.style.top = `${gameFieldRect.bottom + 10}px`;
  _playAgainButton_.style.left = `${gameFieldRect.left}px`;
  document.body.appendChild(_playAgainButton_);

  _playAgainButton_.addEventListener('click', () => {
    tryToRemove('play_again_btn');
    tryToRemove('game-field');
    startToPlay().catch(console.error);
  });
  
  console.info('Game over!');
}

var create_turns_log = function() {
  let container = document.createElement('div');
  container.setAttribute('id', 'turns_log');
  container.setAttribute('position', 'absolute');
  container.left = '50%';
  container.top = '5%';
  document.body.appendChild(container);
}

var write_turn_down = function(move) {
  let text = document.createElement('p');
  document.getElementById('turns_log').appendChild(text);
  text.innerHTML += JSON.stringify(position) + ", " + move;
}

var makeRequest = () => {
  let form = new XMLHttpRequest();
  let url = '';
  form.open('GET', url);
  form.responseType = 'json';
  
}
