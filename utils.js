function set_cell_coordinate(i) { // здесь мы по цифре i вычисляем координаты ячейки
    const rows = ['c', 'b', 'a'];
    const cols = [2, 3, 1];
    return rows[Math.floor((i - 1) / 3)] + cols[(i - 1) % 3];
  }
  
function drawField() {
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
}
  
var all_cells = function() {
  return document.querySelectorAll('.cell');
}

let onload_starting = function() {
    document.body.insertAdjacentHTML(
        "beforebegin", // Варианты: beforebegin, afterbegin, beforeend, afterend
        "<button id=\'playbutton\' class=\'button\' onclick=\'start_to_play().catch(console.error)\'>Play</button>"
    );
}