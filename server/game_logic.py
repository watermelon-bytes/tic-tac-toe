import time
from flask import current_app as app

# Здесь мы будем хранить информацию о сессиях, чтобы она была доступна из разных модулей
sessions = dict()

def empty_board():
    return {f'{letter}{number}': "null" for letter in list('abcd') for number in range(1, 5)}

def deleteSession(session_id: str) -> None:
    if session_id in sessions:
        del sessions[session_id]
        app.logger.info(f"Session (ID: '{session_id}') was successfully removed.")
    else:
        app.logger.error(f"Cannot remove '{session_id}', because this is not an existing session.")

def checkGameStatus(session_id: str) -> str:
    if session_id not in sessions:
        raise ValueError(f"Cannot search '{session_id}'.")

    position = sessions[session_id]["position"]
    client_side = sessions[session_id]["client_side"]
    bot_side = "o" if client_side == "x" else "x"
    board_size = 4
    
    # Проверка строк
    for i in range(board_size):
        row_values = [position[f"{chr(97 + i)}{j + 1}"] for j in range(board_size)]
        if all(v == client_side for v in row_values):
            return "client's victory"
        if all(v == bot_side for v in row_values):
            return "bot's victory"

    # Проверка столбцов
    for j in range(board_size):
        col_values = [position[f"{chr(97 + i)}{j + 1}"] for i in range(board_size)]
        if all(v == client_side for v in col_values):
            return "client's victory"
        if all(v == bot_side for v in col_values):
            return "bot's victory"

    # Проверка диагоналей
    diag1 = [position[f"{chr(97 + i)}{i + 1}"] for i in range(board_size)]
    if all(v == client_side for v in diag1):
        return "client's victory"
    if all(v == bot_side for v in diag1):
        return "bot's victory"

    diag2 = [position[f"{chr(97 + i)}{board_size - i}"] for i in range(board_size)]
    if all(v == client_side for v in diag2):
        return "client's victory"
    if all(v == bot_side for v in diag2):
        return "bot's victory"

    # Проверка на ничью
    if all(value != "null" for value in position.values()):
        return "draw"

    return "pending"


def findBestMove(session_id: str) -> str:
    if session_id not in sessions:
        raise ValueError(f"Сессия с ID '{session_id}' не найдена.")

    position = sessions[session_id]["position"]
    client_side = sessions[session_id]["client_side"]
    bot_side = "o" if client_side == "x" else "x"
    
    # 1. Проверяем, есть ли выигрышный ход для бота
    for cell, value in position.items():
        if value == "null":
            position[cell] = bot_side
            if checkGameStatus(session_id) == "bot's victory":
                position[cell] = "null"
                return cell
            position[cell] = "null"

    # 2. Проверяем, есть ли блокирующий ход для клиента
    for cell, value in position.items():
        if value == "null":
            position[cell] = client_side
            if checkGameStatus(session_id) == "client's victory":
                position[cell] = "null"
                return cell
            position[cell] = "null"
            
    # 3. Если нет выигрышного или блокирующего хода, выбираем первый доступный
    for cell, value in position.items():
        if value == "null":
            return cell

    raise ValueError("Нет доступных ходов.")
