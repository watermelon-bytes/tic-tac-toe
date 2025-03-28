import { set_cell_coordinate, all_cells, drawField, onload_starting  } from './utils.js';


let player = null; // крестик = true, нолик = false. пока не выбрано, null.
let turn = true; // аналогично

let position = {}; 

async function start_to_play() {
    player = null;
    turn = true;  // Всегда начинаем с крестиков
    
    all_cells().forEach(cell => {
        cell.remove();
    });


    if (document.getElementById('playbutton')) {
      document.getElementById('playbutton').remove();
    }
  
    for (let i = 0; i < 9; i++) {
      position[set_cell_coordinate(i)] = null;
    }
    

    console.log('Waiting for choice...');
    
    create_turns_log();

    let choice = await setChoice();
    console.log('Choice:', choice); // проверка
    drawField();
    cellEventListener();
}

function setChoice() {
  return new Promise((resolve) => { // Promise - это объект, который используется для выполнения асинхронных операций и возвращения их результата в будущем.
      let a = 'Play as ';
      const container = document.createElement('div');
      container.setAttribute('id', 'container');
      document.body.appendChild(container);

      x = document.createElement('button');
      x.setAttribute('id', 'x_btn');
      x.textContent = a + 'X';

      o = document.createElement('button');
      o.textContent = a + 'O';
      o.setAttribute('id', 'o_btn');
  
      container.appendChild(x);
      container.appendChild(o); // добавляем кнопки для выбора стороны

      x.addEventListener('click', () => {
        container.remove();
        player = true;
        resolve(true);
      });
  
      o.addEventListener('click', () => {
        container.remove();
        player = false;
        resolve(false);
      });
  });
}

var checkIsTurnPossible = function(this_position) { // проверяем, можно ли сделать ход в эту клетку
  return (position[this_position] === null && !document.getElementById(this_position).hasChildNodes());
}

let development_mode = false

function fillCell(cell_position, current_turn) { 
    let side = document.createElement('img');
    let the_cell = document.getElementById(cell_position);
    
    if (current_turn === true) {
        side.setAttribute('src', 'crestick.png');
        side.alt = 'X';
    } else {
        side.setAttribute('src', 'zero.png');
        side.alt = '0';
    }
    
    if (development_mode) {write_turn_down(cell_position);} // если всё нормально, записываем позицию + ход в log, чтобы обучать потом на партиях бота
    position[cell_position] = current_turn;  // Записываем ход
    the_cell.appendChild(side);
    
    let winner = checkForWinner();
    if (winner !== null || checkForDraw(position)) {
        end_game();
    }

    turn = !turn;
    console.log("Check for win:", winner);
    console.log('Position:', position); // проверка
}

function handler(object) {
    if (object.hasChildNodes() === false) { // проверка на дочерние узлы 
      fillCell(object.id, turn); // здесь мы через cell.id будем получать координаты клетки
    }
}

function cellEventListener() {
    all_cells().forEach(cell => { // здесь cell - это название переменной, которая будет принимать значение каждой клетки
      
      cell._clickHandler = () => {
        if (checkIsTurnPossible(cell.id)) {
            fillCell(cell.id, turn);
        }
    };
    cell.addEventListener('mouseup', cell._clickHandler);
  });
}

/* функция querySelectorAll()ё возвращает статический список
всех элементов с указанным в аргументе аттрибутами в контейнере,
указанном перед точкой. 
hasChildNodes() возвращает true, если есть дочерние узлы, и false, если их нет.
 */

function checkForWinner() {

  function checkForWin(game_position, player_flag) {

    // Object.keys(game_position) => Получаем массив всех ключей объекта game_position
    cells_with_flag_id = Object.keys(game_position)
    cells_with_flag_id = cells_with_flag_id.filter(key => game_position[key] === player_flag); // все клетки с player_flag
    
    /* .filter(key => game_position[key] === player_flag) => фильтруем этот массив, 
    оставляя только те ключи, у которых значение в объекте game_position равно flag */


    let nums = ['1', '2', '3'];
    let letters = ['a', 'b', 'c'];

    var necessary_filter = (index, elem) => {
      return cells_with_flag_id.filter(cell_code => cell_code[index] == elem).length === 3;
    }
    
    for (let first of letters) {
      if (necessary_filter(0, first)) {
        return true;
      }
    }

    for (let second of nums) {
      if (necessary_filter(1, second)) {
        return true;
      }
    }

    /*
    for (let element of cells_with_flag_id) {
      if 
    } */
  }
  let out;
  checkForWin(position, true) ? out = 'X wins!' : checkForWin(position, false) ? out = 'O wins!' : out = null;
  return out;
}



var checkForDraw = function(this_position) {
    const values = Object.values(this_position);
    if (values.every(cell => cell !== null) && checkForWinner() === null) {
        console.info('Draw!');
        return true;
    }
    return false;
  }



async function end_game() {

  all_cells().forEach(cell => {cell.removeEventListener('mouseup', cell._clickHandler);});

  console.info('Game over!');
  alert('Game over!');
  start_to_play();
}

function create_turns_log() {
  const container = document.createElement('div');
  container.setAttribute('id', 'turns_log');
  container.setAttribute('position', 'absolute')
  container.setAttribute('left', '50%');
  container.setAttribute('top', '5%');
  document.body.appendChild(container);
}

function write_turn_down(move) {
  let text = document.createElement('p');
  document.getElementById('turns_log').appendChild(text);
  text.innerHTML += JSON.stringify(position)+ ", " + move;
}
