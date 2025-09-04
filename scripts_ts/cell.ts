import { setCellsCoordinates, gothic, classical } from "./utils.js";
import { GameTheme } from "./utils.js";
type PlayerSymbol = 'x' | 'o';



export class Cell {
    readonly coordinate: string; // id клетки, e.g., 'a1'
    private _value: PlayerSymbol | null; // Значение в клетке ('x', 'o' или null)
    element: HTMLDivElement; // Сам DOM-элемент клетки
    private theme: GameTheme; // Тема для отрисовки X/O

    constructor(sequence_number: number, sideOfField: number, theme: GameTheme = classical) {
        this.coordinate = setCellsCoordinates(sequence_number, sideOfField);
        this._value = null;
        this.theme = theme;

        this.element = document.createElement('div');
        this.element.setAttribute('id', this.coordinate);
        this.element.setAttribute('class', 'cell'); // Класс для базовых стилей
        // Cell сам не устанавливает свойство .classname.title, это относится к его содержимому
    }

    get value(): PlayerSymbol | null {
        return this._value;
    }

    // Метод для отрисовки клетки на поле
    draw(cellSize: number, row: number, column: number): void {
        this.element.style.position = 'absolute';
        this.element.style.width = `${cellSize}px`;
        this.element.style.height = `${cellSize}px`;
        this.element.style.top = `${(row - 1) * cellSize}px`;
        this.element.style.left = `${(column - 1) * cellSize}px`;
        // Важно: добавление в DOM происходит в Game.drawField()
    }

    // Заполнение клетки символом игрока
    fill(symbol: PlayerSymbol): void {
        this._value = symbol; // Обновляем внутреннее значение
        this.element.innerHTML = ''; // Очищаем предыдущее содержимое

        const sideImg = document.createElement('img');
        sideImg.src = symbol === 'x' ? this.theme.x_src : this.theme.o_src;
        sideImg.alt = symbol.toUpperCase();
        this.element.appendChild(sideImg);
    }

    // Очистка клетки (для новой игры)
    clear(): void {
        this._value = null;
        this.element.innerHTML = '';
    }
}