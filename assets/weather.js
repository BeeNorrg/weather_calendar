//day.js date
let now = dayjs().format('dddd/MMMM/D');
//regular expression to replace all instances of "/" with a space
let betterNow = now.replace(new RegExp("/", "g"), " ");
//replace first space witha comma AND space
let evenBetterNow = betterNow.replace(" ", ", ");
console.log("dayjs:", now)
console.log("dayjs formatted", betterNow)
console.log("my dayjs is augmented", evenBetterNow)

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
            $("#cityName").append(cityPruner);

            $("#temp").append($("<p>").html("Temperature: " + fTemp + " &#8457"));
            $("#humid").append($("<p>").html("Humidity: " + humidity + " %"));
            $("#wind").append($("<p>").html("Wind Speed: " + wind + " mph"));

            let UVtext = $("<p>").html(UV);
            $("#uv").append(UVbold);

            //UV index indicator
            $(UVtext).attr("class", "bg-primary mb-3");
            $(UVtext).attr("style", "width: 1rem;");

            // Low 0-2 (black): Moderate 3-5 (gray): High 6-7 (green): Very High: 8-10 (yellow): Extreme 11+ (red)
            if (UV <= 2) {
                $(UVbold).attr("class", "card text-white bg-dark mb-3");
            }
            else if (UV >= 3 && UV <= 5) {
                $(UVbold).attr("class", "card text-white bg-secondary mb-3");
            }
            else if (UV >= 6 && UV <= 7) {
                $(UVbold).attr("class", "card text-white bg-success mb-3");
            }
            else if (UV >= 8 && UV <= 10) {
                $(UVbold).attr("class", "card text-white bg-warning mb-3");
            }
            else {
                $(UVbold).attr("class", "card text-white bg-danger mb-3");
            }

            //appends search history to local storage
            var storedCity = $("#searchCol").val().trim().slice(0,1).toUpperCase() +  $("#searchCol").val().slice(1);
            localStorage.setItem("storedCities", storedCity);
            //adds previous searches to sidebar
            for (var i = 0; i < localStorage.length; i++) {
                var storedCity = localStorage.getItem("storedCities");
                $()
            }

        })//onecall ajax call
    })//weather ajax call
})//searchButton ajax calls end here

