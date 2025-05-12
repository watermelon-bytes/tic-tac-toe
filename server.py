from basic_logic import handle
from uuid import uuid4
from time import time
from flask import *

app = Flask(__name__, template_folder='templates')
app.config['JSON_AS_ASCII'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True

sessions: dict = []

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

def handle_json(jsonobj: dict):
    data = jsonobj.get_json()
    if not ('position' in data and 'turn' in data):
        return jsonify({"error": "Invalid request: Missing required keys"}), 400
    return jsonify(handle(data))

"""
def accept_position(request):
    if request['position'] and request['player']:
        result = handle(request['position'])
        if result:
            return {'answer': result}
        else:
            return False
    else:
        raise ValueError("Invalid request: 'position' key is missing or empty.")

"""

# universe greeting
@app.route('/', methods=["GET", "POST"])
def index():
    return render_template('index.html')


@app.route('/universe', methods=['GET'])
async def greet():
    return {
        "message": "goodbye, universe!",
        "sender": "the last human."
    }

@app.route("/game", methods=["POST"])
async def send_position() -> dict:
    data = request.get_json()
    session_id = data["session_id"]
    if session_id:
        if is_valid_move(data["session_id"], data["move"]):
            sessions[session_id][move] = sessions[session_id]["client_side"]
            return handle()
        else:
            return {"error": "Your JSON is not valid. Try to create new session."}
    else:
        return {"error": "No session found."}


@app.route("/new_session", methods=["POST"])
def initialize_session() -> str:
    logging.debug("Запрос /new_session получен")
    try:
        data = request.get_json()
        logging.debug(f"Полученные данные: {data}")
        right_of_the_first_move = data.get('first_move') # Используй .get() для безопасности
        logging.debug(f"first_move: {right_of_the_first_move}")
        empty_board = {
            'position': {f'{letter}{number}': "null" for letter in list('abcd') for number in range(1, 5)}
        }
        logging.debug(f"Создана пустая доска: {empty_board}")
        session_id = str(uuid4())
        sessions[session_id] = {"board": empty_board, 'first_move': right_of_the_first_move, 'created_at': time()}
        logging.debug(f"Сессия создана: {sessions[session_id]}")
        return jsonify({"session_id": session_id}) # Flask лучше использовать jsonify для возврата JSON
    except Exception as e:
        logging.error(f"Произошла ошибка: {e}")
        return "Internal Server Error", 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=True)