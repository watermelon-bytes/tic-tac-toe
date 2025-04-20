import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neural_network import LogisticRegression
from sklearn.metrics import accuracy_score
from utils import convertPositionForML

content = pd.read_csv('data.txt')
content = content.dropna(axis=0)
df = pd.DataFrame(content)
df['position'] = df['position'].apply(convertPositionForML)

print(content['position'].to_string())

content.head()

if 'position' not in content or 'turn' not in content or 'choice' not in content:
    raise KeyError("Missing required keys in content: 'position', 'turn', or 'choice'")

pos, turn, answer = content['position'], content['turn'], content['choice']

X = np.array(list(zip(pos, turn)))
y = answer

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.02, random_state=42)
print('Done!')

model = LogisticRegression()
model.fit(X_train, y_train)