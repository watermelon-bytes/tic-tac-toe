from basic_logic import handle
from flask import *

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True


@app.route("/", methods=["GET"])
def hello():
    return "Hello, World!"


@app.route("/move", methods=["POST"])
def handle_json():
    data = request.get_json()
    if not ('position' in data and 'turn' in data and 'choice' in data):
        return jsonify({"error": "Invalid request: Missing required keys"}), 400
    return jsonify(handle(data))


def accept_position(request):
    if request['position']:
        result = handle(request['position'])
        if result:
            return {'answer': result}
        else:
            return False
    else:
        raise ValueError("Invalid request: 'position' key is missing or empty.")

def send_position(answer):
    our_answer = accept_position(answer)
    pass # пока без вызова


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)