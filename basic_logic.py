import requests


def accept_position():
    return # эта функция будет получать и возвращать необходимые входные данные


data = accept_position()

def send_position(answer):
    requests.put # пока без вызова

def winning_turn(position):
    letters, numbers = {'a': 0, 'b': 0, 'c': 0}, {'1':0, '2':0, '3':0}
    for elem in position:
        for let, num in letters, numbers:
            if let in elem:
                letters[let] += 1
            if num in elem:
                numbers[num] += 1
    if any(elem[value] == 2 for elem, value in position.items()):
        pass



"""
Help on class filter in module builtins:

class filter(object)
 |  filter(function or None, iterable) --> filter object
 |  
 |  Return an iterator yielding those items of iterable for which function(item)
 |  is true. If function is None, return the items that are true.
 |  
 |  Methods defined here:
 |  
 |  __getattribute__(self, name, /)
 |      Return getattr(self, name).
 |  
 |  __iter__(self, /)
 |      Implement iter(self).
 |  
 |  __next__(self, /)
 |      Implement next(self).
 |  
 |  __reduce__(...)
 |      Return state information for pickling.
 |  
 |  ----------------------------------------------------------------------
 |  Static methods defined here:
 |  
 |  __new__(*args, **kwargs) from builtins.type
 |      Create and return a new object.  See help(type) for accurate signature.
"""