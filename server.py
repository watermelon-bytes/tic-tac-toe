from basic_logic import Server
from flask import *


def send_position(answer):
    our_answer: None
    pass # пока без вызова

@app.route('/api', methods=['POST'])
def accept_position():
    return  # эта функция будет получать и возвращать необходимые входные данные


data = accept_position()
Server.handle(data)