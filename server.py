from basic_logic import Server
from flask import *


def accept_position(request):
    if request['position']:
        result = Server.handle(request['position'])
        if result:
            return {'answer': result}
        else:
            return False
    else:
        raise ValueError("Invalid request: 'position' key is missing or empty.")

def send_position(answer):
    our_answer = accept_position(answer)
    pass # пока без вызова

@app.route("/json", methods=["POST"])
def handle_json():
    return jsonify(Server.handle(request.json))

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)