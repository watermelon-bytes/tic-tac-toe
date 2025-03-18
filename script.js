// на данный момент игра может начинаться ходом нолика, но добавлением бота это будет исправлено (ну я так думаю)
// нужно будет создать связь между python и js, чтобы бот мог делать ходы  

let player = null; // крестик = true, нолик = false. пока не выбрано, null.

let turn = true; // ход

function set_cell_coordinate(i) { // здесь мы по цифре i вычисляем координаты ячейки
    let b = i;
    while (b - 3 > 0) {b = b - 3;} 
    let coordinate = []; // каждая клетка будет записываться по формуле "{  столбик клетки (буква) }{  строка клетки (цифра)  }"

    // ↓ здесь считаем, на какой строке клетка
    if (Math.ceil(i / 3) === 1) {coordinate.push(3);} else if (Math.ceil(i / 3) === 2) {coordinate.push(2);} else {coordinate.push(1);}
  
    // ↓ здесь считаем, на каком столбике клетка
    if (i % 3 === 1) {coordinate += '2';} else if (i % 3 === 2) {coordinate += '3';} else if (i % 3 === 0) {coordinate.push();}
    return coordinate;
}

let position = {}; // словарь, в котором будут храниться координаты клеток и их состояние (пустая или нет)

async function start_to_play() {
    // Сбрасываем значения
    player = null;
    turn = true;  // Всегда начинаем с крестиков
    
    all_cells().forEach(cell => {
        cell.remove();
    });


    // Очищаем поле
    if (document.getElementById('playbutton')) {document.getElementById('playbutton').remove();}
  
    for (let i = 0; i < 9; i++) {
      position[set_cell_coordinate(i)] = null;
    }
    

    console.log('Waiting for choice...');
    
    create_turns_log();

    let choice = await setChoice();
    console.log('Choice:', choice); // проверка


    for (let i = 1; i < 10; i++) {
        const cell = document.createElement('div');
        document.body.appendChild(cell);
        cell.setAttribute('class', 'cell');

        let row = Math.ceil(i / 3);
        let column = (i % 3) + 1;

        cell.style.position = 'fixed';
        
        cell.style.top = (row + 1) * 80 + 'px';
        cell.style.left = (column + 1) * 80 + 'px';

        cell.setAttribute('id', set_cell_coordinate(i));
        
    }
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

function checkIsTurnPossible(this_position) { // проверяем, можно ли сделать ход в эту клетку
  if (position[this_position] === null && !document.getElementById(this_position).hasChildNodes()) {
    return true;
  }
  return false;
}


function fillCell(cell_position, current_turn) { 
    let side = document.createElement('img');
    let the_cell = document.getElementById(cell_position);
    
    if (current_turn === true) {
        side.setAttribute('src', '');
        side.setAttribute('alt', 'X');
    } else {
        side.setAttribute('src', '');
        side.alt = '0';
    }
    write_turn_down(cell_position); // если всё нормально, записываем позицию + ход в log, чтобы обучать потом на партиях бота
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

function all_cells() {
  const all_cells = document.querySelectorAll('.cell');
  return all_cells;
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
    /* .filter(key => game_position[key] === true) => фильтруем этот массив, 
    оставляя только те ключи, у которых значение в объекте game_position равно true/false */
    cells_with_flag_id = Object.keys(game_position).filter(key => game_position[key] === player_flag); // все клетки с ноликами

    if (cells_with_flag_id.length < 3) {return null;}

    for (let letter of ['a', 'b', 'c']) {
      if (cells_with_flag_id.filter(cell_code => cell_code.startsWith(letter)).length === 3) {
        return true;
      };
    }
    for (let number of ['1', '2', '3']) {
      if (cells_with_flag_id.filter(cell_code => cell_code.endsWith(number)).length === 3) {
        return true;
      };
    }
    const diagonals = [['a1', 'b2', 'c3'], ['a3', 'b2', 'c1']];
    for (let diagonal of diagonals) {
      if (cells_with_flag_id.filter(cell_code => diagonal.includes(cell_code)).length === 3) {
        return true;
      }
    }
  }
  
  if (checkForWin(position, true)) {
    console.info('X Win!');
    return true;
  } else if (checkForWin(position, false)) {
    console.info('O Win!');
    return false;
  }
  return null;
}

function checkForDraw(this_position) {
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

