#import ML_logic
import json
import math
import random

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
            if r in all and c in all_:
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

def handle(request: dict) -> dict:
    temp = winning_turn(request['position'], request['player'])
    if temp:
        return {'turn': winning_turn(request['position'])}
    else:
        return {'turn': random.choice()}
        #return directToMLLogic(request['position'])
