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