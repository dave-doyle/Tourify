## Tourify
  


### Abstract
Immerse yourself in Manhattan with Tourify! Tourify integrates React's interactivity, Spring Boot's robustness, and modern Machine Learning tools for an all-in-one solution. Tourify offers real-time route planning, geolocation check-ins at attractions, and uniquely minted NFTs to commemorate your visits. Our Artificial Intelligence model empowers you to make smart travel decisions by calculating the crowd density at prime attractions throughout Manhattan — even into the future!
  
Uniting tech and user-centric design, Tourify elevates your journey, redefining urban exploration. Built for scalability, its modern architecture can enhance travel worldwide.
  
**Welcome Screen**
  
![Screenshot 11](/images/img1.png)
  
**User Interface**
  
![Screenshot 2](/images/img2.png)
      
### Features
* Creating user accounts using Google OAuth
* Real-time busyness predictions for our curated list of attractions in Manhattan
* Route Planning for users to get real-time directions
* Geo-location based Check-ins at tourist attractions
* Rewards for Check-ins that include Badges and a unique minted NFTs sent to their wallet address
* Real-time weather display updates in Manhattan
* A recommender for users to see the nearest and least busy attractions
* Ability to change the users NFT wallet address
* Ability to delete their accounts and all user data hosted on our servers
* Ability to provide user feedback to be fed back into the Machine Learning model to improve the predictions
* A helping starting guide with attached screenshots for how to use each feature on the application
  
### Machine Learning
This folder contains the code for a Flask API that predicts the demand for taxis in different zones based on input parameters. It uses pre-trained Random Forest models that are loaded from pickle files.
  
#### models.py
This file contains the code to load the pre-trained Random Forest models from pickle files. The models are stored in a dictionary called `models`, where the keys are the taxi location IDs and the values are the corresponding loaded models. The pickle files for the models are located in the `pickle_files` directory.

##### api_ml.py
This file defines the Flask API endpoints for receiving prediction requests. It loads the models from the `models.py` file and uses them to make predictions based on the input parameters received in the JSON payload. The API endpoint `/predict` expects a POST request with the input parameters in JSON format. The predicted demand is returned as a JSON response.
The API applies rounding to the prediction value and ensures that it does not exceed 100. 

##### pickle_files
This directory contains the pre-trained Random Forest models saved as pickle files. Each pickle file corresponds to a specific taxi location ID and is loaded by the `models.py` file.

### Linux Server Architecture Diagram

![image](./Linux_Docker_Working-Flow_Diagram.png)

### Project Tech Stack & Architecture 

![image](https://github.com/ajwadjaved/ManhattanJourney/assets/87294643/5b9b5dc9-233d-4e6d-b742-b011ea1e04a7)
  
## Datasets
  
* [Yellow Taxi data from NYC Taxi and Limousine Commission Trip Record Data](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
* [Subway Hourly Ridership from Metropolitan Transportation Authority](https://data.ny.gov/Transportation/MTA-Subway-Hourly-Ridership-Beginning-February-2022/ekwu-khcy)
* [Foot Traffic Data from BestTime.app](https://besttime.app/)
* [Weather Data from Open Weather](https://openweathermap.org/current)
* [Weather Data from Weather Underground](https://www.wunderground.com/history/daily/us/ny/new-york-city/KLGA)
* [Top Attractions within Manhattan](https://www.timeout.com/newyork/attractions/new-york-attractions)

  
## How to Run Tourify Locally

- refer to Linux Server Architecture Diagram above when you want to run Tourify locally 

Here are the steps to properly run the application:
- download docker engine 
- create a network named tourify within docker engine and indicate the network's subnet(172.18.0.0/16)( as to fix ML container's ip address)
- get a ssl cert for your localhost to support google-login function
- change the host name of each api request to localhost 

#### Frontend container
- add .env file which contains the necessary api key in frontend folder
- run npm install && npm run build on IDE and get the build folder
- upload the build folder and frontend dockerfile to docker engine
- build docker image 
- run docker container under the tourify network, map the docker port to a linux port if needed
- edit the coop policy in frontend Apache configuration file to allow pop-up window if the google-login function is blocked by your browser
- restart container after apache editing

#### Backend container 
- upload .jar file and backend dockerfile to docker engine
- build docker image 
- run docker container under the tourify network, map the docker port to a linux port if needed

#### ML container
- upload the whole ML folder include model, flask file and requirement.txt and ML dockerfile to docker engine
- build docker image 
- run docker container under the tourify network, map the docker port to a linux port if needed
- allocate ip :172.18.0.3 manually for ML container when run ML container 

#### Contact
  
This project was made for the UCD COMP47360 summer project. For any questions feel free to get in touch with any of the collaborators.















