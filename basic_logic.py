import ML_logic
import json

def winning_turn(position, player):
    rows = ['a', 'b', 'c', 'd']
    cols = ['1', '2', '3', '4']

    def check_line(player):
        for r in rows:
            line = [r + c for c in cols]
            if sum(position[cell] == player for cell in line) == 3 and any(position[cell] is None for cell in line):
                return next(cell for cell in line if position[cell] is None)

        for c in cols:
            line = [r + c for r in rows]
            if sum(position[cell] == player for cell in line) == 3 and any(position[cell] is None for cell in line):
                return next(cell for cell in line if position[cell] is None)

        diagonals = [
            ['a1', 'b2', 'c3', 'd4'],
            ['a4', 'b3', 'c2', 'd1']
        ]
        for diag in diagonals:
            if sum(position[cell] == player for cell in diag) == 3 and any(position[cell] is None for cell in diag):
                return next(cell for cell in diag if position[cell] is None)
    
    checking_player = player  # текущий игрок
    # Проверяем, если текущий игрок может выиграть в следующем ходе
    if check_line(checking_player):
        return check_line(checking_player)  # возвращаем выигрышный ход
    
    checking_player = not player  # переключаем игрока
    if check_line(checking_player): # теперь ищем блокирующий ход
        return check_line(checking_player) 
    
    return False # если нет выигрышного или блокирующего хода

def directToMLLogic(request):
    # Прямой вызов функции winning_turn для обработки запроса
    return ML_logic.make_move(request['position'], request['player'])
    

class Server:
    def handle(request):
        if winning_turn(request['position']):
            return {'answer': winning_turn(request['position'])}
        else:
            directToMLLogic(request['position'])