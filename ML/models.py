import joblib

# Load the models numbers (corresponding to taxi_locationID)
models = [42, 43, 45, 88, 100, 142, 148, 158, 161, 162, 163, 164, 170, 230, 234, 236, 246, 249, 261]

main_model = joblib.load('ML/pickle_files/main_model.pkl')