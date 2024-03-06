import React, { createContext, useState, useEffect, useContext } from 'react';
import { MapContext } from './MapContext';

const APIContext = createContext();

const APIContextProvider = ({ children }) => {
  const [apiAttractions, setAPIAttractions] = useState(null);
  const [apiCurrentWeather, setAPICurrentWeather] = useState(null);
  const [apiWeatherForecast, setAPIWeatherForecast] = useState(null);
  const [apiAllCurrentBusyness, setAPIAllCurrentBusyness] = useState(null);
  const [day1Params, setDay1Params] = useState(null);
  const [day2Params, setDay2Params] = useState(null);
  const [day3Params, setDay3Params] = useState(null);
  const [day4Params, setDay4Params] = useState(null);
  const [busynessPred, setBusynessPred] = useState(null);
  const [day2BusynessPred, setDay2BusynessPred] = useState(null);
  const [day3BusynessPred, setDay3BusynessPred] = useState(null);
  const [day4BusynessPred, setDay4BusynessPred] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [globalUserInfo, setGlobalUserInfo] = useState();
  const [globalCredential, setGlobalCredential] = useState();
  const [checkinState, setCheckinState] = useState(false);
  const [badgeState, setBadgeState] = useState(null);
  const [newBadgeState, setNewBadgeState] = useState(null);
  const [currentModelTempParam, setCurrentModelTempParam] = useState(null);
  const [currentModelRainParam, setCurrentModelRainParam] = useState(null);
  const [updateClick, setUpdateClick] = useState(0);
  const [chartVisible, setChartVisible] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [activeChart, setActiveChart] = useState(null); // for only showing the chart on the correct attraction
  const [apisLoaded, setAPIsLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [nftPrompt, setNftPrompt] = useState(null);
  const [attractionsWithBusyness, setAttractionsWithBusyness] = useState(null);
  const [filteredAttractions, setFilteredAttractions] =
    useState(apiAttractions);
  const [sliderValue, setSliderValue] = useState([0, 100]);

  const { mapCenter } = useContext(MapContext);

  

  useEffect(() => {
    const fetchAttractionData = async () => {
      try {
        const response = await fetch(
          //'https://csi6220-2-vm1.ucd.ie/backend/api/attraction/getAllAttraction'
          'http://34.244.182.238:8001/api/attraction/getAllAttraction'
        );
        const data = await response.json(); //long/lat data
        const dataArray = data.data;

        // setting open or closed boolean
        const currentTime = new Date();

        // to convert time to NYC time
        const options = {
          timeZone: 'America/New_York',
          hour12: false,
        };

        const currentTimeEDT = currentTime.toLocaleString('en-US', options);

        const currentDay = currentTime.getDay();

        const dayMapping = {
          0: 'sunday',
          1: 'monday',
          2: 'tuesday',
          3: 'wednesday',
          4: 'thursday',
          5: 'friday',
          6: 'saturday',
        };

        dataArray.forEach(attraction => {
          if (
            attraction.name === 'Brooklyn Bridge' ||
            attraction.name === 'Greenwich Village' ||
            attraction.name === 'Harlem'
          ) {
            attraction.isOpen = true;
          } else {
            const openingHours = attraction['openHour'];
            const currentDayKey = dayMapping[currentDay].toLowerCase() + 'Open';
            const currentDayOpeningTime = openingHours[currentDayKey];
            const currentDayClosingTime =
              openingHours[currentDayKey.replace('Open', 'Close')];

            if (
              currentDayOpeningTime !== null &&
              currentDayClosingTime !== null
            ) {
              const currentHoursEDT = new Date(currentTimeEDT).getHours();
              const currentMinutesEDT = new Date(currentTimeEDT).getMinutes();
              const openingHour = parseInt(currentDayOpeningTime.split(':')[0]);
              const openingMinute = parseInt(
                currentDayOpeningTime.split(':')[1]
              );
              let closingHour = parseInt(currentDayClosingTime.split(':')[0]);
              const closingMinute = parseInt(
                currentDayClosingTime.split(':')[1]
              );

              // for 12am and 1am closing times
              if (closingHour === 0) {
                closingHour = 24;
              } else if (closingHour === 1) {
                closingHour = 25;
              }

              if (
                (currentHoursEDT > openingHour ||
                  (currentHoursEDT === openingHour &&
                    currentMinutesEDT >= openingMinute)) &&
                (currentHoursEDT < closingHour ||
                  (currentHoursEDT === closingHour &&
                    currentMinutesEDT < closingMinute))
              ) {
                attraction.isOpen = true;
              } else {
                attraction.isOpen = false;
              }
            } else {
              attraction.isOpen = false;
            }
          }
          // setOpeningHoursAdded(true);
        });

        setAPIAttractions(dataArray);
        setApiLoaded(true);
      } catch (error) {
        setApiLoaded(false);
      }
    };

    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${mapCenter.lat}&lon=${mapCenter.lng}&units=imperial&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
        );
        const data = await response.json();
        setAPICurrentWeather(data);
        setCurrentModelTempParam(Math.floor(data.main.temp)); // must convert kelvin to fahrenheit
        if (data.rain) {
          setCurrentModelRainParam(data.rain['1h'] / 25.4); // must convert millimetres to inches
        } else {
          setCurrentModelRainParam(0);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchAttractionData();
    fetchWeatherData();
  }, []);

  useEffect(() => {
    const fetchAllCurrentBusynessData = async () => {
      try {
        if (currentModelTempParam && currentModelRainParam >= 0) {
          const response = await fetch(
            //`https://csi6220-2-vm1.ucd.ie/backend/api/attraction/getAllPrediction?temperature=${currentModelTempParam}&precipitation=${currentModelRainParam}`
            `http://34.244.182.238:8001/api/attraction/getAllPrediction?temperature=${currentModelTempParam}&precipitation=${currentModelRainParam}`
          );
          const data = await response.json();
          const dataArray = data.data;
          setAPIAllCurrentBusyness(dataArray);
        }
      } catch (error) {}
    };
    fetchAllCurrentBusynessData();
  }, [currentModelTempParam, currentModelRainParam, updateClick]);

  useEffect(() => {
    const getForecast = async () => {
      try {
        // setAttractionID(attractionID);
        const response = await fetch(
          `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${mapCenter.lat}&lon=${mapCenter.lng}&units=imperial&appid=${process.env.REACT_APP_OPEN_WEATHER_API_KEY}`
        );
        const data = await response.json();

        setAPIWeatherForecast(data.list);
      } catch (error) {}
    };
    getForecast();
  }, []);

  useEffect(() => {
    // processing the weather forecast into parameters for the model
    if (apiWeatherForecast) {
      // convert rain from millimetres to inches
      apiWeatherForecast.forEach(hour => {
        if (hour.rain) {
          const rainInches = hour.rain['1h'] / 25.4;
          hour.rain = rainInches;
        }
      });

      const tempArray = apiWeatherForecast.map(hour => {
        return {
          temperature: hour.main.temp,
        };
      });

      const rainArray = apiWeatherForecast.map(hour => {
        return {
          rain: hour.rain ? hour.rain : 0,
        };
      });

      const tempValues = tempArray.map(hour => hour.temperature);
      const rainValues = rainArray.map(hour => hour.rain);

      setDay1Params([
        {
          day: 1,
          temperature: tempValues.slice(0, 24),
          rain: rainValues.slice(0, 24),
        },
      ]);

      setDay2Params([
        {
          day: 2,
          temperature: tempValues.slice(24, 48),
          rain: rainValues.slice(24, 48),
        },
      ]);

      setDay3Params([
        {
          day: 3,
          temperature: tempValues.slice(48, 72),
          rain: rainValues.slice(48, 72),
        },
      ]);

      setDay4Params([
        {
          day: 4,
          temperature: tempValues.slice(72, 96),
          rain: rainValues.slice(72, 96),
        },
      ]);
    }
  }, [apiWeatherForecast]);

  const fetchBusynessPredictions = async (attractionID, params) => {
    if (params && attractionID) {
      if (chartData) {
        setChartData(null);
      }
      setChartVisible(true);
      setActiveChart(attractionID);
      try {
        const response = await fetch(
          //`https://csi6220-2-vm1.ucd.ie/backend/api/attraction/getOnePrediction?attraction_id=${attractionID}&predictionDays=${params[0].day}&temperatures=${params[0].temperature}&precipitation=${params[0].rain}`
          `http://34.244.182.238:8001/api/attraction/getOnePrediction?attraction_id=${attractionID}&predictionDays=${params[0].day}&temperatures=${params[0].temperature}&precipitation=${params[0].rain}`
        );
        const data = await response.json();
        const dataArray = data.data.attractionPredictionDetailVOList;
        if (
          attractionID !== '64a412387432f019915b07c9' &&
          attractionID !== '64a414087432f019915b07cc'
        ) {
          dataArray.forEach(hour => {
            if (hour.openOrClose === false) {
              hour.businessRate = 0;
            }
          });
        }
        setChartData({
          labels: data.data.attractionPredictionDetailVOList.map(
            hour => hour.hour
          ),
          datasets: [
            {
              label: 'Busyness Index',
              data: data.data.attractionPredictionDetailVOList.map(
                hour => hour.businessRate
              ),
              backgroundColor: 'rgba(255, 165, 0, 0.2)',
              borderColor: 'rgba(255, 165, 0, 1)',
              borderWidth: 1,
            },
          ],
        });
        // setDay1BusynessPred(data1.data.attractionPredictionDetailVOList);
        setBusynessPred({
          id: attractionID,
          busynessPreds: data.data.attractionPredictionDetailVOList,
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
  };

  const [sliderList, setSliderList] = useState(null);

  useEffect(() => {
    // adds busyness score to attractions info object

    if (apiAttractions && apiAllCurrentBusyness) {
      apiAttractions.forEach(attraction => {
        const matchingPred = apiAllCurrentBusyness.find(
          prediction => prediction.name === attraction.name
        );
        if (matchingPred) {
          if (attraction.isOpen === false) {
            attraction.businessRate = 0;
          } else {
            attraction.businessRate = matchingPred.businessRate;
          }
        }
      });
      setSliderList(apiAttractions); // so all markers load when page loads
      setAttractionsWithBusyness(apiAttractions);
    }
  }, [apiAllCurrentBusyness]);

  useEffect(() => {
    if (attractionsWithBusyness) {
      const filtered = attractionsWithBusyness.filter(
        attraction =>
          attraction.businessRate >= sliderValue[0] &&
          attraction.businessRate <= sliderValue[1]
      );
      setFilteredAttractions(filtered);
    }
  }, [sliderValue]);

  useEffect(() => {
    if (filteredAttractions) {
      setSliderList(filteredAttractions);
    }
  }, [filteredAttractions]);

  useEffect(() => {
    if (
      apiAttractions &&
      currentModelTempParam &&
      currentModelRainParam >= 0 &&
      apiAllCurrentBusyness
    ) {
      setAPIsLoaded(true);
      setTimeout(() => {
        setShowLoading(false);
      }, 2000);
    }
  }, [
    apiAttractions,
    currentModelTempParam,
    currentModelRainParam,
    apiAllCurrentBusyness,
  ]);

  return (
    <APIContext.Provider
      value={{
        apiAttractions,
        setAPIAttractions,
        apiLoaded,
        globalUserInfo,
        setGlobalUserInfo,
        setGlobalCredential,
        globalCredential,
        setCheckinState,
        checkinState,
        badgeState,
        setBadgeState,
        newBadgeState,
        setNewBadgeState,
        apiCurrentWeather,
        apiAllCurrentBusyness,
        currentModelTempParam,
        fetchBusynessPredictions,
        busynessPred,
        day2BusynessPred,
        day3BusynessPred,
        day4BusynessPred,
        updateClick,
        setUpdateClick,
        day1Params,
        day2Params,
        day3Params,
        day4Params,
        chartVisible,
        chartData,
        setChartData,
        activeChart,
        setChartVisible,
        apisLoaded,
        showLoading,
        nftPrompt,
        setNftPrompt,
        filteredAttractions,
        setFilteredAttractions,
        sliderList,
        setSliderList,
        attractionsWithBusyness,
        setAttractionsWithBusyness,
        sliderValue,
        setSliderValue,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};

export { APIContext, APIContextProvider };
