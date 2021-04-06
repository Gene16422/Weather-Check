$(document).ready(function () {


  var cityStorage = localStorage;
  var cityList = [];
  //API pieces
  const APIKEY = "336492724cb592860c6dc411b4318a39";
  var targetCity = "";
  var targetCityLon = "";
  var targetCityLat = "";

  //function to retrieve local storage 
  function retrievePastSearches() {
    if (cityStorage.getItem("pastCities") != undefined) {
      cityList = JSON.parse(cityStorage.getItem("pastCities"));
      for (var i = 0; i < cityList.length; i++) {
        //add past list to sidebar
        var newRecentSearchLink = $("<a href=\"\#\"></a>");
        newRecentSearchLink.text(cityList[i]);
        newRecentSearchLink.attr("data-city", cityList[i]);
        newRecentSearchLink.attr("class", "recentSearchItem list-group-item list-group-item-action");
        $("#results").prepend(newRecentSearchLink);
      }
    }
  }


  retrievePastSearches();
  //save search to local storage
  function savePastSearches() {
    cityStorage.setItem("pastCities", JSON.stringify(cityList));
  }

  $("#button-addon2").on("click", function () {
    event.preventDefault;
    console.log(`Searching for ${$("#searchTermEntry").val()} data.`);
    targetCity = $("#searchTermEntry").val();

    getCurrentWeatherData(targetCity);
  });

  //Main Search Function
  function getCurrentWeatherData(cityName) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + `${cityName}&appid=${APIKEY}`
    }).then(function (currentResponse) {

      //add current search to list
      // check if already there
      var alreadyInList = false;
      for (var a = 0; a < $("#results").children().length; a++) {
        var existingEntry = $("#results").children().get(a).textContent;
        if (existingEntry === cityName) {
          console.log(`${existingEntry} already in list.`);
          alreadyInList = true;
        }
      }
      // if not, add it 
      if (alreadyInList === false) {
        var newRecentSearchLink = $("<a href=\"\#\"></a>");
        newRecentSearchLink.text(cityName);
        newRecentSearchLink.attr("data-city", cityName);
        newRecentSearchLink.attr("class", "recentSearchItem list-group-item list-group-item-action");
        $("#results").prepend(newRecentSearchLink);

        // and update storage
        cityList.push(cityName);
        savePastSearches();
      }

      // ammend main search
      $("#currentWeatherCity").text(currentResponse.name);
      $("#currentWeatherIcon").attr("src", `https://openweathermap.org/img/wn/${currentResponse.weather[0].icon}@2x.png`); // weather icon
      $("#currentTempSpan").html(`${tempKtoF(currentResponse.main.temp)}&deg;F`); // todo Change to F
      $("#currentHumiditySpan").text(`${currentResponse.main.humidity}%`);
      $("#currentWindSpan").text((currentResponse.wind.speed) + " MPH"); //Change to MPH

      //coords for UV 
      targetLon = currentResponse.coord.lon;
      targetLat = currentResponse.coord.lat;

      // five day forecast
      getFiveDayForecast(targetLat, targetLon);

      // UV index API
      getUVIndex(targetLat, targetLon);


    });
  }

  //get UV index for main search page
  function getUVIndex(latitude, longitude) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + `${APIKEY}&lat=${latitude}&lon=${longitude}`
    }).then(function (UVresponse) {

      $("#currentUVSpan").text(UVresponse.value);
      var UVunit = parseInt(UVresponse.value);

      // color UV display 
      if (UVunit <= 5) {
        // Low Index
        $("#currentUVSpan").css("background-color", "#97D700");
        $("#currentUVSpan").css("color", "#000000");
      } else if (UVunit >= 6 && UVunit <= 9) {
        // Moderate Index
        $("#currentUVSpan").css("background-color", "#FCE300");
        $("#currentUVSpan").css("color", "#000000");
      } else if (UVunit > 10) {
        // High Index
        $("#currentUVSpan").css("background-color", "#FF8200");
        $("#currentUVSpan").css("color", "#FFFFFF");
      }
      var currentDataDate = moment(UVresponse.date_iso);
      $("#currentWeatherDate").text(currentDataDate.format("MM/DD/YYYY"));
    });
  }

  //  get 5-day forecast 
  function getFiveDayForecast(latitude, longitude) {
    // clear any existing five-day forecast 
    $("#fiveDayCardsRow").empty();

    $.ajax({
      method: "GET",
      url: `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${APIKEY}`
    }).then(function (fiveDayResponse) {
      var fiveDayForecastList = fiveDayResponse.daily;
      for (var l = 1; l < 6; l++) { //select five days from forecast

        // display forecasts on the screen
        var dailyDate = moment(fiveDayForecastList[l].dt, "X");
        var fiveDayCardDateTxt = dailyDate.format("MM/DD/YYYY");
        var fiveDayCardIconSrc = `https://openweathermap.org/img/wn/${fiveDayForecastList[l].weather[0].icon}@2x.png`;
        var fiveDayCardTempTxt = `Temp: ${tempKtoF(fiveDayForecastList[l].temp.day)} °F`;//change to F
        var fiveDayCardHumidTxt = `Humidity: ${fiveDayForecastList[l].humidity}%`;

        // ammend the sheet
        var newFiveDayCard = document.createElement("div");
        $(newFiveDayCard).attr("class", "fiveDayCard card m-3");
        $("#fiveDayCardsRow").append(newFiveDayCard);
        var newFiveDayCardBody = $("<div>");
        $(newFiveDayCard).append(newFiveDayCardBody);
        $(newFiveDayCardBody).attr("class", "card-body");

        // date 
        var newFiveDayCardHeading = document.createElement("h4");
        $(newFiveDayCardHeading).attr("class", "card-title fiveDayDate");
        $(newFiveDayCardHeading).text(fiveDayCardDateTxt);
        $(newFiveDayCardBody).append(newFiveDayCardHeading);

        // icon
        var newFiveDayCardIcon = document.createElement("img");
        $(newFiveDayCardIcon).attr("src", fiveDayCardIconSrc);
        $(newFiveDayCardBody).append(newFiveDayCardIcon);

        // temp
        var newFiveDayCardTemp = document.createElement("p");
        $(newFiveDayCardTemp).text(fiveDayCardTempTxt);
        $(newFiveDayCardBody).append(newFiveDayCardTemp);

        // humidity
        var newFiveDayCardHumidity = document.createElement("p");
        $(newFiveDayCardHumidity).text(fiveDayCardHumidTxt);
        $(newFiveDayCardBody).append(newFiveDayCardHumidity);
      }
    });
  }

  //temperature conversion
  function tempKtoF(Ktemp) {
    var Ftemp = ((Ktemp - 273.15) * 9 / 5) + 32
    return Math.floor(Ftemp);
  }

  // function to display previous search results 
  $(".recentSearchItem").click(function () {
    event.preventDefault;
    console.log(`Clicked on ${this.dataset.city}.`);
    getCurrentWeatherData(this.dataset.city);
  });

});