from uuid import uuid4
import time
from flask import Flask, render_template, request, jsonify, send_from_directory
from game_logic import findBestMove, checkGameStatus, empty_board, deleteSession, sessions

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['JSON_AS_ASCII'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True

@app.route('/')
def index():
    return render_template('index.html')

@app.route(f'/scripts/<path:filename>')
def custom_static(filename):
    return send_from_directory('scripts', filename)

@app.route("/new_session", methods=["POST"])
def newSession():
    try:
        data = request.get_json()
        session_id = str(uuid4()) + '-0'
        sessions[session_id] = {
            "position": empty_board(),
            'last_updated_at': round(time.time()),
            'client_side': data["client_side"]
        }
        app.logger.info(f"Сессия создана: {sessions[session_id]}")
        return jsonify({"session_id": session_id})
    except Exception as e:
        app.logger.error(f"Произошла ошибка при создании сессии: {e}")
        return "Internal Server Error", 500

@app.route("/game", methods=["POST"])
def sendPosition():
    data = request.get_json()
    app.logger.info(f"Полученные данные: {data}")
    
    session_id = data.get("session_id")
    move = data.get("move")
    
    if not all([session_id, move]):
        return jsonify({"error": "Неверный формат запроса. Отсутствуют session_id или move."}), 400

    if session_id not in sessions:
        return jsonify({"error": "Сессия не найдена."}), 404
    
    # Обновляем позицию на доске
    sessions[session_id]['position'][move] = sessions[session_id]["client_side"]
    sessions[session_id]["last_updated_at"] = time.time()
    
    game_status = checkGameStatus(session_id)
    
    if game_status == "pending":
        ai_move = findBestMove(session_id)
        bot_side = "o" if sessions[session_id]["client_side"] == "x" else "x"
        sessions[session_id]["position"][ai_move] = bot_side
        sessions[session_id]["last_updated_at"] = time.time()
        
        game_status_after_bot = checkGameStatus(session_id)
        
        if game_status_after_bot == "bot's victory" or game_status_after_bot == "draw":
            deleteSession(session_id)
        
        return jsonify({"move": ai_move, "status": game_status_after_bot})
    else:
        deleteSession(session_id)
        return jsonify({"status": game_status})

@app.route('/get_sessions')
def get_sessions():
    return jsonify(sessions)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=True, threaded=True)
