from numpy import array
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
#from sklearn.metrics import accuracy_score
from utils import convertPositionForML
import joblib

# Load the data
DF = pd.read_csv('model/data.txt').dropna(axis=0)
print(DF.describe())

pos, turn, answer = DF['position'], DF['turn'], DF['choice']

X, y = list(), list()

print('Done!')

for _, row in DF.iterrows():
    features, label = convertPositionForML(row["position"], row["turn"], row["choice"])
    X.append(features)
    y.append(label)


X_train, X_test, y_train, y_test = train_test_split(array(X), array(y), test_size=0.2, random_state=42)

model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# Save the model
try:
    joblib.dump(model, 'model/agent.pkl')
except FileNotFoundError:
    print("File 'model/agent.pkl' found. Please check the path.")
