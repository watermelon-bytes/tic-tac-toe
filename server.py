from basic_logic import handle
from uuid import uuid4
from time import time
from flask import Flask, render_template, request, jsonify, send_from_directory
from utils import *

app = Flask(__name__, template_folder='templates')
app.config['JSON_AS_ASCII'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True


sessions = dict()
empty_board = {f'{letter}{number}': "null" for letter in list('abcd') for number in range(1, 5)}


def is_valid_move(data_json: dict) -> bool:
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

def handle_json(jsonobj: dict):
    data = jsonobj.get_json()
    if not ('position' in data and 'turn' in data):
        return jsonify({"error": "Invalid request: Missing required keys"}), 400
    return jsonify(handle(data))

@app.route('/', methods=["GET", "POST"])
def index():
    return render_template('index.html')

@app.route(f'/scripts/<path:filename>')
def custom_static(filename):
    return send_from_directory('scripts', filename)

@app.route("/game", methods=["POST"])
async def send_position() -> dict:
    data = request.get_json()
    app.logger.info(f"Gotten data: {data}")
    session_id = data["session_id"]
    if is_valid_move(data):
        sessions[session_id]["move"] = sessions[session_id]["client_side"]
        sessions[session_id]["last_updated_at"] = time()

        
    else:
        return {"error": "Your JSON is not valid. Try to create new session."}

@app.route("/new_session", methods=["POST"])
def initialize_session() -> str:
    app.logger.info("Запрос /new_session получен")
    try:
        data = request.get_json()
        app.logger.info(f"Полученные данные: {data}")
        #right_of_the_first_move = data.get('first_move')
        #app.logger.info(f"first_move: {right_of_the_first_move}")
        
        app.logger.info(f"Создана пустая доска: {empty_board}")
        session_id = str(uuid4()) + '-' + moves_made
        sessions[session_id] = {"position": empty_board, 'created_at': time(), 'client_side': data['client_side']} # можно ещё 'first_move': right_of_the_first_move 
        app.logger.info(f"Сессия создана: {sessions[session_id]}")
        return jsonify({"session_id": session_id})
    except Exception as e:
        app.logger.info(f"Произошла ошибка: {e}")
        return "Internal Server Error", 500

@app.route('/get_sessions')
def get_sessions():
    return sessions


def deleteSession(id: str):
    try:
        del sessions[id]
    except KeyError:
        app.logger.error(f"Cannot delete {id}, 'cause it does not exist.")
    
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=True, use_reloader=True, threaded=True)