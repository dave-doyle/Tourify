import sys
from flask import Flask, request, jsonify
import traceback
import pandas as pd
import joblib
import numpy as np
from flask_cors import CORS  # Import the CORS module
from zipfile import ZipFile

# Import the main_model and models list of taxi_locationIDs
from ML.models import models, main_model

# Your API definition
app = Flask(__name__)
CORS(app)  # This enables CORS for the entire app

@app.route('/predict', methods=['POST'])
def predict():
    try:
        json_ = request.json
        print(json_)

        # Extract the input parameters from the JSON data
        try:
            taxi_locationID = json_['taxi_locationID']
        except KeyError:
            taxi_locationID = None
            
        try:
            name_alias = json_['name_alias']
        except KeyError:
            name_alias = None
            
        try:
            passengers = json_['passengers']
        except KeyError:
            passengers = None     
            
        month = json_['month']
        day_of_week = json_['day_of_week']
        hour = json_['hour']
        temp_avg = json_['temp_avg']
        precipitation = json_['precipitation']

        # Check if the taxi_locationID exists in the models list
        if taxi_locationID in models:
            # Determine the appropriate zip archive based on taxi_locationID
            if taxi_locationID <= 107:
                archive_filename = 'pickle_files/backup_pickle_files_1.zip'
            elif taxi_locationID <= 153:
                archive_filename = 'pickle_files/backup_pickle_files_2.zip'
            elif taxi_locationID <= 231:
                archive_filename = 'pickle_files/backup_pickle_files_3.zip'
            else:
                archive_filename = 'pickle_files/backup_pickle_files_4.zip'

            # Load the corresponding model based on the taxi_locationID from the zip archive
            with ZipFile(archive_filename, 'r') as archive:
                model_filename = f'{taxi_locationID}.pkl'
                with archive.open(model_filename) as file:
                    model = joblib.load(file)

            # Create a new DataFrame with the input data for prediction
            new_data = pd.DataFrame({
                'month': [month],
                'day_of_week': [day_of_week],
                'hour': [hour],
                'taxi_locationID': [taxi_locationID],
                'passengers': [passengers],
                'temp_avg': [temp_avg],
                'precipitation': [precipitation]
            })

            # Use the loaded model to make predictions
            predictions = model.predict(new_data)

        else:
            # Create a new DataFrame with the input data for prediction
            new_data = pd.DataFrame({
                'month': [month],
                'day_of_week': [day_of_week],
                'hour': [hour],
                'name_alias': [name_alias], 
                'temp_avg': [temp_avg],
                'precipitation': [precipitation]
            })

            # Use the main_model to make predictions
            predictions = main_model.predict(new_data)

        # Round the prediction to the nearest whole number
        prediction = round(predictions[0])

        # If prediction is greater than 100, set it to 100
        if prediction > 100:
            prediction = 100

        return jsonify({'prediction': prediction})

    except:
        return jsonify({'trace': traceback.format_exc()})

if __name__ == '__main__':
    try:
        port = int(sys.argv[1])  # This is for a command-line input
    except:
        port = 5000  # If you don't provide any port, the port will be set to 5000

    print('Models loaded')
    app.run(port=port, debug=True)
