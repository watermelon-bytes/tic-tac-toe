from json import loads as toDict

sessions: dict = []


def convertPositionForML(position: str, turn: int, choice: str) -> tuple:
    position = toDict(position.replace("'", '"'))
    letters = ['a', 'b', 'c', 'd']
    numbers = ['1', '2', '3', '4']
    features = [[]]

    #true, false, null = True, False, None
    for letter in letters:
        for number in numbers:
            key = letter + number
            value = position.get(key)
            if value == True:
                features[0].append(1)
            elif value == False:
                features[0].append(-1)
            else:
                features[0].append(0)
    
    features.append(turn)

    row = letters.index(choice[0])
    col = int(choice[1]) - 1
    label = row * 4 + col

    return features, label

def is_valid_move(session_id: str, move: str) -> bool:
    if session_id not in sessions:
        raise ValueError(f"Ошибка: Сессия с ID '{session_id}' не найдена.")
        return False

    board = sessions[session_id]['board']
    if not board:
        raise ValueError(f"Ошибка: Доска для сессии '{session_id}' не инициализирована.") 
        return False

    if len(move) != 2:
        raise ValueError(f"Ошибка: Некорректный формат хода '{move}'. Ожидается 'буква-цифра'.")
        return False

    if not 'A' <= move[0].upper() <= 'D' or not '1' <= move[1] <= '4':
        print(f"Ошибка: Некорректные координаты хода '{move}'.")
        return False
