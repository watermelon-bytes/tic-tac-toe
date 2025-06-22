from uuid import uuid4
import time
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__, template_folder='templates')
app.config['JSON_AS_ASCII'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True


sessions = dict()
def empty_board():
    return {f'{letter}{number}': "null" for letter in list('abcd') for number in range(1, 5)}


@app.route('/', methods=["GET", "POST"])
def index():
    return render_template('index.html')

@app.route(f'/scripts/<path:filename>')
def custom_static(filename):
    return send_from_directory('scripts', filename)


@app.route("/new_session", methods=["POST"])
def newSession():
    session_id: str
    try:
        data = request.get_json()
        app.logger.info(f"Полученные данные: {data}")
        #right_of_the_first_move = data.get('first_move')
        #app.logger.info(f"first_move: {right_of_the_first_move}")
        
        session_id = str(uuid4()) + '-0'  # 0 is count of moves made
        sessions[session_id] = {"position": empty_board(), 'last_updated_at': round(time.time()), 'client_side': data["client_side"]}
        app.logger.info(f"Сессия создана: {sessions[session_id]}")
        #await setUpTimeTracking(session_id, 100)
        return jsonify({"session_id": session_id})
    except Exception as e:
        app.logger.info(f"Произошла ошибка: {e}")
        return "Internal Server Error", 500


@app.route("/game", methods=["POST"])
async def sendPosition():
    data = request.get_json()
    app.logger.info(f"Gotten data: {data}")
    session_id = data["session_id"]
    sessions[session_id]['position'][data["move"]] = sessions[session_id]["client_side"]

    if isValidMove(data):
        sessions[session_id]["last_updated_at"] = time.time()
        game_status = checkGameStatus(session_id)
        app.logger.info(f"Position before server's move: {sessions[session_id]['position']}")
        if game_status == "pending":
            ai_move = findBestMove(session_id)

            app.logger.info(f"AI's move: {ai_move}")
            
            sessions[session_id]["position"][ai_move] = "x" if sessions[session_id]["client_side"] == "o" else "o"
            sessions[session_id]["last_updated_at"] = time.time()
            
            if checkGameStatus(session_id) == "bot's victory":
                deleteSession(session_id)
                return jsonify({"move": ai_move, "status": "bot's victory"})
            elif checkGameStatus(session_id) == "draw":
                app.logger.info(f"Game {session_id} status: draw")
                deleteSession(session_id)
                return jsonify({"move": ai_move, "status": "draw"})
            elif checkGameStatus(session_id) == "client's victory":
                deleteSession(session_id)
                return jsonify({"status": "client's victory"})
            else:
                return jsonify({"move": ai_move})
        
        else:
            app.logger.info(f"Game status: {game_status}")
            return jsonify({"status": game_status})
    
    return {"error": "Your JSON is not valid. Try to create new session."}


@app.route('/get_sessions')
def get_sessions():
    return sessions

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
    rows = [[f"{chr(97 + i)}{j + 1}" for j in range(board_size)] for i in range(board_size)]
    cols = [[f"{chr(97 + j)}{i + 1}" for j in range(board_size)] for i in range(board_size)]
    diagonals = [
        [f"{chr(97 + i)}{i + 1}" for i in range(board_size)],
        [f"{chr(97 + i)}{board_size - i}" for i in range(board_size)]
    ]

    for line in rows + cols + diagonals:
        values = [position[cell] for cell in line]
        if all(v == client_side for v in values):
            return "client's victory"
        if all(v == bot_side for v in values):
            return "bot's victory"

    if all(value != "null" for value in position.values()):
        return "draw"

    return "pending"


def findBestMove(session_id: str) -> str:
    if session_id not in sessions:
        raise ValueError(f"Сессия с ID '{session_id}' не найдена.")

    position = sessions[session_id]["position"]
    current_player = sessions[session_id]["client_side"]
    opponent = "o" if current_player.lower() == "x" else "x"

    # Проверяем все возможные ходы
    for cell, value in position.items():
        if value == "null":  # Если клетка свободна
            # Сделать временный ход
            position[cell] = opponent

            # Проверить, выигрывает ли этот ход
            if checkGameStatus(session_id) == opponent:
                position[cell] = "null"  # Отменить временный ход
                return cell  # Вернуть выигрышный ход

            # Отменить временный ход
            position[cell] = "null"

    for cell, value in position.items(): # Ищем блокирующий ход
        if value == "null":  # Если клетка свободна 
            # Сделать временный ход
            position[cell] = current_player

            # Проверить, выигрывает ли этот ход
            if checkGameStatus(session_id) == current_player:
                position[cell] = "null"  # Отменить временный ход
                return cell  # Вернуть блокирующий ход

            # Отменить временный ход
            position[cell] = "null"

    # Если нет выигрышного хода, выбираем первый доступный
    for cell, value in position.items():
        if value == "null":
            return cell  # Вернуть первый доступный ход

    # Если нет доступных ходов (хотя это не должно случиться)
    raise ValueError("Нет доступных ходов.")


def isValidMove(data_json: dict) -> bool:
    session_id, move = data_json["session_id"], data_json["move"];
    if not (session_id in sessions):
        raise ValueError(f"Ошибка: Сессия с ID '{session_id}' не найдена.")
        return False

    if not sessions[session_id]['position']:
        raise ValueError(f"Ошибка: Доска для сессии '{session_id}' не инициализирована.")
        return False

    if len(move) != 2:
        raise ValueError(f"Ошибка: Некорректный формат хода '{move}'. Ожидается 'буква-цифра'.")
        return False

    if not 'A' <= move[0].upper() <= 'D' or not '1' <= move[1] <= '4':
        print(f"Ошибка: Некорректные координаты хода '{move}'.")
        return False
    return True


async def setUpTimeTracking(session_id: str, timeout: float) -> None:
    if not session_id in sessions:
        app.logger.error(f"Cannot delete {session_id}, 'cause it does not exist.")
        return
    time.sleep(timeout)
    del sessions[session_id]

    
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=True, use_reloader=True, threaded=True)