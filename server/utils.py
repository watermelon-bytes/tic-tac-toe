from json import loads

def opponent(player: str) -> str:
    if player == 'client':
        return 'server'
    elif player == 'server':
        return 'client'

def convertPositionForML(position: str, turn: int, choice: str) -> tuple:
    position = loads(position.replace("'", '"'))
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

def everyInList(arr: list, value: callable) -> bool:
    for i in arr:
        if not value(i):
            return False
    return True

