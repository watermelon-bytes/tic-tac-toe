import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


content = pd.read_csv('data.txt')
content = content.dropna(axis=0)


content.head()

pos, turn, answer = content['position'], content['turn'], content['choice']

X = [pos, turn]
y = answer

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.02, random_state=42)
print('Done!')