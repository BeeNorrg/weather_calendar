let searches = [];
let storedSearches = JSON.parse(localStorage.getItem("cityStorage"))

//day.js date
let now = dayjs().format('dddd/MMMM/D');
console.log("dayjs:", now)
//regular expression to replace all instances of "/" with a space
let betterNow = now.replace(new RegExp("/", "g"), " ");
console.log("dayjs formatted", betterNow)
//replace first space witha comma AND space
let augmentedNow = betterNow.replace(" ", ", ");
console.log("my dayjs is augmented", augmentedNow)

//constructs search history
function historyBuild(){
        for (i = 0; i < searches.length; i++) {
            let pulledCity = searches[i];
            let buttonMaker = $("<button>").attr("class", "searchHistory");
            let historyButton = buttonMaker.html(pulledCity);
            $("#history").append(historyButton);
        }
}

//adds searched cities to local storage if they aren't already in there
function searchParse(){
    let storedCity = $("#city").val().trim().slice(0,1).toUpperCase() + $("#city").val().trim().slice(1).toLowerCase();
    console.log("storedCity:", storedCity);
    if (searches.includes(storedCity)) {
        console.log("already stored!")
    } else {
        searches.push(storedCity);
    }
    localStorage.setItem("cityStorage", JSON.stringify(searches))
}

//readies our local storage variable when the DOM renders
$(document).ready(function(){
    //checks to see if there's past searches in city storage
    if (storedSearches !== null){
        searches = storedSearches;
        console.log("searches:",searches)
        $("#history").empty();
        historyBuild();
    } else {
        $("#history").append("Nothing here! try searching for a city");
    }
    //placeholder for last searched city
    let lastCity = "";
    //determines last searched city
    for (i=0; i < searches.length; i++) {
        if (i === searches.length - 1) {
            lastCity = searches[i];
            console.log("lastCity:", lastCity);
        }
    }

    let lastURL = "https://api.openweathermap.org/data/2.5/weather?q=" + lastCity + "&appid=6b8354596eeef05a9add5fcdc34efb38";

    $.ajax({
        url: lastURL,
        method: "GET"
    }).done(function (weather) {
        //clear search history card since we'll be updating it with this search
        $("#history").empty();
        const latitude = weather.coord.lat;
        const longitude = weather.coord.lon;
        let weatherURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=6b8354596eeef05a9add5fcdc34efb38";

        //ajax call for rest of weather info
        $.ajax({
            url: weatherURL,
            method: "GET"
        }).then(function (onecall) {
            //get temp(converted to farenheit), humidity, wind speed,
            let kTemp = onecall.current.temp;
            let fTemp = Math.round((kTemp * (9 / 5)) - 459.67)
            let humidity = onecall.current.humidity;
            let wind = onecall.current.wind_speed;
            let UV = onecall.current.uvi;
            let icon = onecall.current.weather[0].icon;
        
            //clear the weather values from previous search
            $("#cityName").empty();
            $("#temp").empty();
            $("#humid").empty();
            $("#wind").empty();
            $("#uv").empty();

            //attaching weather variables to DOM elements
            $("#cityName").append(lastCity + ", " + augmentedNow);

            $("#temp").append($("<p>").html("Temperature: " + fTemp + " &#8457"));
            $("#humid").append($("<p>").html("Humidity: " + humidity + " %"));
            $("#wind").append($("<p>").html("Wind Speed: " + wind + " mph"));

            let UVtext = $("<span>").html(UV);
            //UV index indicator
            $(UVtext).attr("class", "bg-primary mb-3");
            $(UVtext).attr("style", "width:30px; padding-left:5px;");

            // Low 0-2 (black): Moderate 3-5 (gray): High 6-7 (green): Very High: 8-10 (yellow): Extreme 11+ (red)
            if (UV <= 2) {
                $(UVtext).attr("class", "card text-white bg-dark mb-3");
            }
            else if (UV >= 3 && UV <= 5) {
                $(UVtext).attr("class", "card text-white bg-secondary mb-3");
            }
            else if (UV >= 6 && UV <= 7) {
                $(UVtext).attr("class", "card text-white bg-success mb-3");
            }
            else if (UV >= 8 && UV <= 10) {
                $(UVtext).attr("class", "card text-white bg-warning mb-3");
            }
            else {
                $(UVtext).attr("class", "card text-white bg-danger mb-3");
            }
            $("#uv").append("UV index: ");
            $("#uv").append(UVtext);
            //add search to history if it's not there already
            historyBuild();
            $("#forecast").empty();
            $("#forecast").html("<header> 5 Day Forecast");
            console.log("onecall daily length:", onecall.daily.length);
            for (i=1; i < onecall.daily.length; i++) {
                console.log(onecall.daily[i]);
                if (i > 5) {
                    break;
                } 
                let forecastCard = $("<figure>");
                forecastCard.attr("class", "card text-white bg-primary");
                forecastCard.css({"display": "inline-block", "font-size": "medium", "text-align": "center", "margin": "10px", "max-width": "150px",})
                let foreDate = dayjs(onecall.daily[i].dt*1000).format('dddd/MMMM/D');
                console.log(foreDate);
                let betterDate = foreDate.replace(new RegExp("/", "g"), " ");
                let improvedDate = betterDate.replace(" ", ", ");
                console.log(improvedDate);
                let foreIcon = onecall.daily[i].weather[0].icon;
                let foreKTemp = onecall.daily[i].temp.day;
                let foreFTemp = $("<p>").html("Temp: " + (Math.round((foreKTemp * (9 / 5)) - 459.67) +
                    " &#8457"));
                let futureHumid = $("<p>").html("Humidity: " + onecall.daily[i].humidity + "%");
                let futureEl = $("<img>");
                let futureURL = "https://openweathermap.org/img/wn/" + foreIcon + "@2x.png";
                let futureIcon = $(futureEl).attr("src", futureURL);
                forecastCard.append(improvedDate);
                forecastCard.append(futureIcon);
                forecastCard.append(foreFTemp);
                forecastCard.append(futureHumid);
                $("#forecast").append(forecastCard);
            }
        })//onecall ajax call
    })//weather ajax call
});

//ajax call for searching a city
$("#searchBtn").click(function () {
    //takes in user input, trims the text to be URL-friendly, and uses it to set up the URL for our ajax call
    let city = $("#city").val().trim();
    //fixes that city variable right up
    let cityPruner = city.slice(0,1).toUpperCase() + city.slice(1).toLowerCase();
    console.log("pruned city:", cityPruner);
    let latLongURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityPruner + "&appid=6b8354596eeef05a9add5fcdc34efb38";
    console.log(latLongURL);

     //ajax call for longitude and latitude
     $.ajax({
        url: latLongURL,
        method: "GET"
    }).done(function (weather) {
        //clear search history card since we'll be updating it with this search
        $("#history").empty();
        const latitude = weather.coord.lat;
        const longitude = weather.coord.lon;
        let weatherURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=6b8354596eeef05a9add5fcdc34efb38";

        //ajax call for rest of weather info
        $.ajax({
            url: weatherURL,
            method: "GET"
        }).then(function (onecall) {
            //get temp(converted to farenheit), humidity, wind speed,
            let kTemp = onecall.current.temp;
            let fTemp = Math.round((kTemp * (9 / 5)) - 459.67)
            let humidity = onecall.current.humidity;
            let wind = onecall.current.wind_speed;
            let UV = onecall.current.uvi;
            let icon = onecall.current.weather[0].icon;
        
            //clear the weather values from previous search
            $("#cityName").empty();
            $("#temp").empty();
            $("#humid").empty();
            $("#wind").empty();
            $("#uv").empty();

            //attaching weather variables to DOM elements
            $("#cityName").append(cityPruner + ", " + augmentedNow);

            $("#temp").append($("<p>").html("Temperature: " + fTemp + " &#8457"));
            $("#humid").append($("<p>").html("Humidity: " + humidity + " %"));
            $("#wind").append($("<p>").html("Wind Speed: " + wind + " mph"));

            let UVtext = $("<span>").html(UV);
            //UV index indicator
            $(UVtext).attr("class", "bg-primary mb-3");
            $(UVtext).attr("style", "width:30px; padding-left:5px;");

            // Low 0-2 (black): Moderate 3-5 (gray): High 6-7 (green): Very High: 8-10 (yellow): Extreme 11+ (red)
            if (UV <= 2) {
                $(UVtext).attr("class", "card text-white bg-dark mb-3");
            }
            else if (UV >= 3 && UV <= 5) {
                $(UVtext).attr("class", "card text-white bg-secondary mb-3");
            }
            else if (UV >= 6 && UV <= 7) {
                $(UVtext).attr("class", "card text-white bg-success mb-3");
            }
            else if (UV >= 8 && UV <= 10) {
                $(UVtext).attr("class", "card text-white bg-warning mb-3");
            }
            else {
                $(UVtext).attr("class", "card text-white bg-danger mb-3");
            }
            $("#uv").append("UV index: ");
            $("#uv").append(UVtext);
            //add search to history if it's not there already
            searchParse();
            historyBuild();
            $("#forecast").empty();
            $("#forecast").html("<header> 5 Day Forecast");
            console.log("onecall daily length:", onecall.daily.length);
            for (i=1; i < onecall.daily.length; i++) {
                console.log(onecall.daily[i]);
                if (i > 5) {
                    break;
                } 
                let forecastCard = $("<figure>");
                forecastCard.attr("class", "card text-white bg-primary");
                forecastCard.css({"display": "inline-block", "font-size": "medium", "text-align": "center", "margin": "10px", "max-width": "150px",})
                let foreDate = dayjs(onecall.daily[i].dt*1000).format('dddd/MMMM/D');
                console.log(foreDate);
                let betterDate = foreDate.replace(new RegExp("/", "g"), " ");
                let improvedDate = betterDate.replace(" ", ", ");
                console.log(improvedDate);
                let foreIcon = onecall.daily[i].weather[0].icon;
                let foreKTemp = onecall.daily[i].temp.day;
                let foreFTemp = $("<p>").html("Temp: " + (Math.round((foreKTemp * (9 / 5)) - 459.67) +
                    " &#8457"));
                let futureHumid = $("<p>").html("Humidity: " + onecall.daily[i].humidity + "%");
                let futureEl = $("<img>");
                let futureURL = "https://openweathermap.org/img/wn/" + foreIcon + "@2x.png";
                let futureIcon = $(futureEl).attr("src", futureURL);
                forecastCard.append(improvedDate);
                forecastCard.append(futureIcon);
                forecastCard.append(foreFTemp);
                forecastCard.append(futureHumid);
                $("#forecast").append(forecastCard);
            }
        })//onecall ajax call
    })//weather ajax call
})//searchButton ajax calls end here

//ajax call for searching an already searched city
$("#history").on('click', '.searchHistory', function(event) {
    //prevent bubbling
    event.stopPropagation();
    event.stopImmediatePropagation();
    //city to be searched is whichever search history button was pressed
    let pastCity = $(event.target).text();
    console.log("pastCity:", pastCity);
    let pastURL = "https://api.openweathermap.org/data/2.5/weather?q=" + pastCity + "&appid=6b8354596eeef05a9add5fcdc34efb38";
    console.log("pastURL:", pastURL);
     //ajax call for longitude and latitude
     $.ajax({
        url: pastURL,
        method: "GET"
    }).done(function (weather) {
        //clear search history card since we'll be updating it with this search
        $("#history").empty();
        
        const latitude = weather.coord.lat;
        const longitude = weather.coord.lon;

        let weatherURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=6b8354596eeef05a9add5fcdc34efb38";
        //ajax call for rest of weather info
        $.ajax({
            url: weatherURL,
            method: "GET"
        }).then(function (onecall) {


            //get temp(converted to farenheit), humidity, wind speed,
            let kTemp = onecall.current.temp;
            let fTemp = Math.round((kTemp * (9 / 5)) - 459.67)
            let humidity = onecall.current.humidity;
            let wind = onecall.current.wind_speed;
            let UV = onecall.current.uvi;
            let icon = onecall.current.weather[0].icon;
            
            //clear the weather values from previous search
            $("#cityName").empty();
            $("#temp").empty();
            $("#humid").empty();
            $("#wind").empty();
            $("#uv").empty();

            //attaching weather variables to DOM elements
            $("#cityName").append(pastCity + ", " + augmentedNow);

            $("#temp").append($("<p>").html("Temperature: " + fTemp + " &#8457"));
            $("#humid").append($("<p>").html("Humidity: " + humidity + " %"));
            $("#wind").append($("<p>").html("Wind Speed: " + wind + " mph"));

            let UVtext = $("<span>").html(UV);
            //UV index indicator
            $(UVtext).attr("class", "bg-primary mb-3");
            $(UVtext).attr("style", "width:30px; padding-left:5px;");

            // Low 0-2 (black): Moderate 3-5 (gray): High 6-7 (green): Very High: 8-10 (yellow): Extreme 11+ (red)
            if (UV <= 2) {
                $(UVtext).attr("class", "card text-white bg-dark mb-3");
            }
            else if (UV >= 3 && UV <= 5) {
                $(UVtext).attr("class", "card text-white bg-secondary mb-3");
            }
            else if (UV >= 6 && UV <= 7) {
                $(UVtext).attr("class", "card text-white bg-success mb-3");
            }
            else if (UV >= 8 && UV <= 10) {
                $(UVtext).attr("class", "card text-white bg-warning mb-3");
            }
            else {
                $(UVtext).attr("class", "card text-white bg-danger mb-3");
            }
            $("#uv").append("UV index: ");
            $("#uv").append(UVtext);
            historyBuild();
            $("#forecast").empty();
            $("#forecast").html("<header> 5 Day Forecast");
            console.log("onecall daily length:", onecall.daily.length);
            for (i=1; i < onecall.daily.length; i++) {
                console.log(onecall.daily[i]);
                if (i > 5) {
                    break;
                } 
                let forecastCard = $("<figure>");
                forecastCard.attr("class", "card text-white bg-primary");
                forecastCard.css({"display": "inline-block", "font-size": "medium", "text-align": "center", "margin": "10px", "max-width": "150px",})
                let foreDate = dayjs(onecall.daily[i].dt*1000).format('dddd/MMMM/D');
                console.log(foreDate);
                let betterDate = foreDate.replace(new RegExp("/", "g"), " ");
                let improvedDate = betterDate.replace(" ", ", ");
                console.log(improvedDate);
                let foreIcon = onecall.daily[i].weather[0].icon;
                let foreKTemp = onecall.daily[i].temp.day;
                let foreFTemp = $("<p>").html("Temp: " + (Math.round((foreKTemp * (9 / 5)) - 459.67) +
                    " &#8457"));
                let futureHumid = $("<p>").html("Humidity: " + onecall.daily[i].humidity + "%");
                let futureEl = $("<img>");
                let futureURL = "https://openweathermap.org/img/wn/" + foreIcon + "@2x.png";
                let futureIcon = $(futureEl).attr("src", futureURL);
                forecastCard.append(improvedDate);
                forecastCard.append(futureIcon);
                forecastCard.append(foreFTemp);
                forecastCard.append(futureHumid);
                $("#forecast").append(forecastCard);
            }
        })//onecall ajax call
    })//weather ajax call
})//searchHistory ajax calls end here

