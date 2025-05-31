#import ML_logic
import json
import math
import random
from utils import every_in_list

#def directToMLLogic(request):
    # Прямой вызов функции winning_turn для обработки запроса
    #return ML_logic.make_move(request['position'], request['player'])

def winning_turn(position: dict, player: bool) -> any:
    rows = ['a', 'b', 'c', 'd']
    cols = ['1', '2', '3', '4']

    required_cells = math.sqrt(len(position)) - 1

    def check_line(player):
        for r in rows:
            line = [r + c for c in cols]
            if sum(position[cell] == player for cell in line) == required_cells and any(position[cell] is None for cell in line):
                return next((cell for cell in line if position[cell] is None), None)

        for c in cols:
            line = [r + c for r in rows]
            if sum(position[cell] == player for cell in line) == required_cells and any(position[cell] is None for cell in line):
                return next((cell for cell in line if position[cell] is None), None)
        
        all_ = "".join([elem for elem in position.keys() if position[elem] == player])
        count = 0
        for r, c in zip(rows, cols):
            if r in all_ and c in all_:
                count += 1
        if count == required_cells and any(position[cell] is None for cell in position.keys()):
            return next((cell for cell in position.keys() if position[cell] is None), None)
    
    new_position = position.copy()

    check_win, check_blocking = check_line(player), check_line(not player)
    if check_win:
        new_position[check_line(player)] = player
        return new_position   # возвращаем выигрышный ход
    
    elif check_blocking: # теперь ищем блокирующий ход
        new_position[check_line(not player)] = player
        return new_position
    
    return False # если нет выигрышного или блокирующего хода

def handle(position: dict, side: str) -> dict:
    temp = winning_turn(position, side)
    if temp:
        return {'move': winning_turn(position)}
    else:
        return {'move': random.choice(valid_moves(position))}
        #return directToMLLogic(request['position'])


def valid_moves(position: dict) -> list:
    rows = ['a', 'b', 'c', 'd']
    cols = ['1', '2', '3', '4']
    valid_moves = []
    for r in rows:
        for c in cols:
            if position[r + c] == 'null':
                valid_moves.append(r + c)
    return valid_moves



def check_for_winner(board: dict) -> 'X' | 'O' | 'pending' | 'draw':
    rows = ['a', 'b', 'c', 'd']
    cols = ['1', '2', '3', '4']

    if check_for_draw(board):
        return 'draw'

    for r in rows:
        if all(board[r + c] == 'X' for c in cols):
            return 'X'
        if all(board[r + c] == 'O' for c in cols):
            return 'O'

    for c in cols:
        if all(board[r + c] == 'X' for r in rows):
            return 'X'
        if all(board[r + c] == 'O' for r in rows):
            return 'O'

    if all(board[rows[i] + cols[i]] == 'X' for i in range(4)):
        return 'X'
    if all(board[rows[i] + cols[i]] == 'O' for i in range(4)):
        return 'O'

    if all(board[rows[i] + cols[3 - i]] == 'X' for i in range(4)):
        return 'X'
    if all(board[rows[i] + cols[3 - i]] == 'O' for i in range(4)):
        return 'O'

    return 'null'

def check_for_draw(this_position: dict) -> bool:
    values = list(this_position.values())
    if all(cell != 'null' for cell in values) and check_for_winner() == 'null':
        print('Draw!')
        return True
    return False