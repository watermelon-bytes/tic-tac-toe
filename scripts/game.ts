import * as utils from "./utils.js";
import { Cell } from "./cell.js";


/*-----------GLOBAL TYPES-------------------------------------------*/
type GameTheme = utils.GameTheme;
type GameSymbol = 'x' | 'o';
type GameResult = 'x' | 'o' | 'draw' | null;
/*-------------------------------------------------------------*/


export default class Game {
    session_id: string | null = null;
    playerSymbol: GameSymbol | null = null; // Выбранная игроком сторона
    position: { [coordinate: string]: GameSymbol | null } = {}; // Состояние поля
    currentTurn: GameSymbol = 'x'; // Чей сейчас ход (начинает 'x')
    sideOfField: number;
    cells: Cell[] = []; // пересмотреть. возможно, не нужно.
    gameContainer: HTMLDivElement | null = null; // Контейнер игрового поля
    gameTheme: GameTheme;

    // Для логирования ходов (если development_mode)
    private turnsLogContainer: HTMLDivElement | null = null;

    constructor(initialSide: number = 4, theme: GameTheme = utils.classical) {
        this.sideOfField = initialSide;
        this.gameTheme = theme;

        for (let i = 0; i < this.sideOfField ** 2; i++) {
            this.cells.push(new Cell(i, this.sideOfField));
            this.position[this.cells[i].coordinate] = null;
        }
    }

    // 1. Создание новой сессии
    async initializeSession(): Promise<any> {
        if (!this.playerSymbol) throw new Error("Player symbol must be chosen before initializing a session.");

        const session_request = await fetch('/new_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                first_move: this.playerSymbol === 'x' ? 'client' : 'server',
                client_side: this.playerSymbol
            })
        });

        if (session_request.ok) {
            const result = await session_request.json();
            if (result && typeof result.session_id === 'string') {
                return result.session_id;
            } else {
                throw new Error("Server response missing session_id or invalid format.");
            }
        } else {
            throw new Error(`Cannot create a session now. Status: ${session_request.status}. Try later.`);
        }
    }

    async makeMove(cellId: string): Promise<void> {
        if (!this.session_id) {
            console.error("Game session not initialized.");
            return;
        }
        if (!this.isValidMove(cellId)) {
            console.warn(`Invalid move: Cell ${cellId} is already occupied.`);
            return;
        }
        if (this.currentTurn !== this.playerSymbol) {
            console.warn("It's not your turn.");
            return;
        }

        this.position[cellId] = this.currentTurn; // Обновляем позицию клиента до отправки
        const playerCell = this.cells.find(cell => cell.coordinate === cellId);
        if (playerCell) {
            playerCell.fill(this.currentTurn); // Отрисовываем ход клиента
        }
        this.logTurn(cellId, this.currentTurn); // Логируем ход клиента

        // Проверяем победителя сразу после хода игрока
        let winner = this.checkForWinner();
        if (winner !== null || this.checkForDraw()) {
            this.endGame(winner);
            return;
        }

        this.currentTurn = this.currentTurn === 'x' ? 'o' : 'x'; // Переключаем ход

        // Отправка хода на сервер
        try {
            const data_about_our_game = {
                session_id: this.session_id,
                move: cellId
            };

            const request = await fetch('/game', {
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                method: 'POST',
                body: JSON.stringify(data_about_our_game)
            });

            if (!request.ok) {
                const errorText = await request.text();
                throw new Error(`Server error: ${request.status} - ${errorText}`);
            }

            const responseData = await request.json();

            if (responseData.error) {
                throw new Error(`Server application error: ${responseData.error}`);
            }

            // Если сервер ответил корректно и прислал свой ход
            if (responseData.move && this.isValidMove(responseData.move)) {
                const serverMoveCellId = responseData.move;
                this.position[serverMoveCellId] = this.currentTurn; // Обновляем позицию для хода сервера
                const serverCell = this.cells.find(cell => cell.coordinate === serverMoveCellId);
                if (serverCell) {
                    serverCell.fill(this.currentTurn); // Отрисовываем ход сервера
                }
                this.logTurn(serverMoveCellId, this.currentTurn); // Логируем ход сервера

                winner = this.checkForWinner(); // Проверяем победителя после хода сервера
                if (winner !== null || this.checkForDraw()) {
                    this.endGame(winner);
                    return;
                }
                this.currentTurn = this.currentTurn === 'x' ? 'o' : 'x'; // Переключаем ход обратно на игрока
            } else if (responseData.move && !this.isValidMove(responseData.move)) {
                console.error(`Server returned an invalid move: ${responseData.move}`);
                this.endGame(null); // Завершаем игру, так как сервер вернул некорректный ход
            }

        } catch (error: any) {
            console.error('Error during game request:', error.message);
            // Можно добавить логику для показа сообщения об ошибке пользователю
            this.endGame(null); // Завершаем игру при ошибке
        }
    }

    // 3. Функция на проверку валидности хода
    isValidMove(move: string): boolean {
        return this.position[move] === null;
    }

    // 4. Отрисовка доски
    drawField(): void {
        if (this.gameContainer) {
            this.gameContainer.remove(); // Удаляем старое поле, если есть
        }
        this.gameContainer = document.createElement('div');
        this.gameContainer.setAttribute('id', 'game-field');
        this.gameContainer.setAttribute('class', 'game-container');
        document.body.appendChild(this.gameContainer);

        const cellSize = Math.min(window.innerWidth, window.innerHeight) / (this.sideOfField + 1) / 1.5;

        this.cells = []; // Очищаем массив клеток перед новой отрисовкой
        for (let i = 1; i <= this.sideOfField ** 2; i++) {
            const cell = new Cell(i, this.sideOfField, this.gameTheme);
            const row = Math.ceil(i / this.sideOfField);
            const column = (i - 1) % this.sideOfField + 1;

            cell.draw(cellSize, row, column); // Отрисовка стилей клетки
            this.gameContainer.appendChild(cell.element); // Добавление элемента в DOM

            // Добавляем обработчик клика на элемент клетки
            cell.element.addEventListener('click', () => {
                this.makeMove(cell.coordinate).catch(console.error);
            });

            this.cells.push(cell); // Добавляем Cell объект в массив
        }

        this.gameContainer.style.position = 'relative';
        this.gameContainer.style.width = `${cellSize * this.sideOfField}px`;
        this.gameContainer.style.height = `${cellSize * this.sideOfField}px`;
        this.gameContainer.style.margin = '0 auto';
    }

    // 5. Проверка на победителя
    checkForWinner(): GameResult {
        const checkWin = (game_position: { [key: string]: GameSymbol | null }, player_flag: GameSymbol): boolean => {
            const playerCells = Object.keys(game_position).filter(key => game_position[key] === player_flag);
            const letters = ['a', 'b', 'c', 'd']; // Предполагаем 4x4 поле
            const numbers = ['1', '2', '3', '4'];

            // Горизонтальные линии
            for (let letter of letters) {
                if (numbers.every(number => playerCells.includes(letter + number))) {
                    return true;
                }
            }
            // Вертикальные линии
            for (let number of numbers) {
                if (letters.every(letter => playerCells.includes(letter + number))) {
                    return true;
                }
            }
            // Диагонали (только для 4x4)
            const diag1 = letters.every((l, i) => playerCells.includes(l + numbers[i]));
            const diag2 = letters.every((l, i) => playerCells.includes(l + numbers[numbers.length - 1 - i]));
            return diag1 || diag2;
        };

        if (checkWin(this.position, 'x')) return 'x';
        if (checkWin(this.position, 'o')) return 'o';
        return null;
    }

    // 6. Проверка на ничью
    checkForDraw(): boolean {
        const values = Object.values(this.position);
        return values.every(cell => cell !== null) && this.checkForWinner() === null;
    }

    // 7. Завершение игры
    endGame(winner: GameResult): void {
        this.cells.forEach(cell => {
            // Клонируем элемент и заменяем его, чтобы удалить все обработчики событий
            // Это простой способ гарантировать отсутствие висячих обработчиков.
            const oldElement = cell.element;
            const newElement = oldElement.cloneNode(true) as HTMLDivElement;
            oldElement.parentNode?.replaceChild(newElement, oldElement);
            cell.element = newElement; // Обновляем ссылку на новый элемент
        });

        const message = winner !== null ? `${winner.toUpperCase()} wins!` : 'Draw!';
        console.info(message);

        // Показываем кнопку "Play again"
        const playAgainButton = document.createElement('button');
        playAgainButton.innerHTML = 'Play again?';
        playAgainButton.id = 'play_again_btn';
        utils.stylization('play_again_btn', 'prim', playAgainButton); // Использовать стилизацию с элементом

        if (this.gameContainer) {
            const gameFieldRect = this.gameContainer.getBoundingClientRect();
            playAgainButton.style.position = 'absolute';
            playAgainButton.style.top = `${gameFieldRect.bottom + 10}px`;
            playAgainButton.style.left = `${gameFieldRect.left}px`;
        }
        document.body.appendChild(playAgainButton);

        playAgainButton.addEventListener('click', async () => {
            playAgainButton.remove();
            this.gameContainer?.remove();
            await this.startGame().catch(console.error); // Начинаем новую игру
        });

        console.info('Game over!');
    }

    // 8. Выбор символа игрока (Client Side)
    private choosePlayerSymbol(): Promise<GameSymbol> {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            container.setAttribute('id', 'container');
            document.body.appendChild(container);

            const promptText = 'Play as ';

            ['x', 'o'].forEach((elem: any) => {
                const button = document.createElement('button');
                button.setAttribute('id', `${elem}_btn`);
                button.textContent = promptText + elem.toUpperCase();
                utils.stylization(button.id, 'sec', button); // Использовать стилизацию с элементом
                container.appendChild(button);

                button.addEventListener('click', () => {
                    container.remove();
                    this.playerSymbol = elem;
                    resolve(elem);
                });
            });
        });
    }

    // 9. Основная функция для запуска игры
    async startGame(): Promise<void> {
        // Очищаем предыдущее состояние для новой игры
        this.session_id = null;
        this.playerSymbol = null;
        this.currentTurn = 'x'; // X всегда начинает по умолчанию
        this.position = {};
        for (let i = 1; i <= this.sideOfField ** 2; i++) {
            this.position[utils.setCellsCoordinates(i, this.sideOfField)] = null;
        }
        this.cells.forEach(cell => cell.clear()); // Очищаем визуально клетки

        document.getElementById('playbutton')?.remove();
        document.getElementById('game-field')?.remove(); // Удаляем поле, если оно есть
        this.turnsLogContainer?.remove(); // Удаляем старый лог

        console.log('Waiting for choice...');
        /*if (development_mode) {
            this.createTurnsLog();
        }*/

        // 1. Выбор символа
        this.playerSymbol = await this.choosePlayerSymbol();
        console.log('Player choice:', this.playerSymbol);

        // 2. Инициализация сессии
        try {
            this.session_id = await this.initializeSession();
            console.log('Session ID:', this.session_id);
        } catch (error: any) {
            console.error('Failed to initialize session:', error.message);
            // Можно предложить пользователю попробовать еще раз или показать ошибку
            document.body.appendChild(document.createElement('p')).textContent = "Failed to start game: " + error.message;
            return; // Прекращаем игру, если сессия не создана
        }

        this.drawField();

        // 4. Если первый ход за сервером (если игрок выбрал 'o')
        if (this.playerSymbol === 'o') {
            console.log("Server makes the first move...");
            //...
        }
    }

    // Вспомогательные функции для режима разработки
    private createTurnsLog(): void {
        this.turnsLogContainer = document.createElement('div');
        this.turnsLogContainer.setAttribute('id', 'turns_log');
        this.turnsLogContainer.style.position = 'absolute'; // Исправлена опечатка 'position'
        this.turnsLogContainer.style.right = '10px';
        this.turnsLogContainer.style.top = '10px';
        document.body.appendChild(this.turnsLogContainer);
    }

    private logTurn(move: string, symbol: GameSymbol): void {
        if (this.turnsLogContainer) {
            const text = document.createElement('p');
            text.innerHTML = `Position: ${JSON.stringify(this.position)}, Turn: ${symbol}, Move: "${move}"`;
            this.turnsLogContainer.appendChild(text);
        }
    }
}