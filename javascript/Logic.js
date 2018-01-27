// Firebase set up and deployment
var config = {
    apiKey: "AIzaSyDe26dXdinNMwrd5ZcMCF50NaHHplhHP0w",
    authDomain: "travelapp-7ed71.firebaseapp.com",
    databaseURL: "https://travelapp-7ed71.firebaseio.com",
    projectId: "travelapp-7ed71",
    storageBucket: "travelapp-7ed71.appspot.com",
    messagingSenderId: "651038382322"
    };

firebase.initializeApp(config);

var database = firebase.database();

// API Keys for use if daily search abilities are reached
var geoplacesApiKey0 = 'AIzaSyBtFyKPzOmCiguFJEQNXfRdMsqIia2oqSk';
var geoplacesApiKey1 = 'AIzaSyAGSfQ__issw6jvRIGyAspjxxwV53GTP5c';
var geoplacesApiKey2 = 'AIzaSyBla269WqKcDmjRCj1rqyTCw88wSwMIgQs';
var geoplacesApiKey3 = 'AIzaSyA_rHgXs_vLb2tUX2qesrBdF0ijvGFA4GM';
var geoplacesApiKey4 = 'AIzaSyDYDV-ay382NoDxM-WQTtSVzju6pp8v3yI';
var geoplacesApiKey5 = 'AIzaSyAZEIrQAkq-XiUz7EvqcHi878-DUA2xCBM';
var geoplacesApiKey6 = 'AIzaSyAtTcT_IofDsjFlCOzk6XQ3jP_YyQRplUI'
var geoMapsEmbedApiKey = 'AIzaSyCN2Ot2OCVfI9m7dkS9oAR5mPgM6_sVS9M';

// CORS Api for Google API work around
var cors_api_url = 'https://cors-anywhere.herokuapp.com/';

// Default search for initial load
var searchName = 'Minneapolis';

// Search parameters allows
var pointofInterestQuery = " point of interest";
var restaurantQuery = " restaurant";
var hotelQuery = " hotel";

// API Key array and current index to be looped through in case of error
var apiKeyArray = [geoplacesApiKey0, geoplacesApiKey1, geoplacesApiKey2, geoplacesApiKey3, geoplacesApiKey4, geoplacesApiKey5, geoplacesApiKey6];
var currentIndex = 0;

$(document).ready(function() {

    // Initial load function using default search 
    grabGoogleData(searchName, pointofInterestQuery, apiKeyArray[currentIndex]);
    
    // Initial modal open 
    $('.modal').modal();
    $('.modal').modal('open');
   
    // Autocomplete option to initialize search, or if autocomplete fails the ability to manually enter search terms
    $('#search').keyup(function(event) {
          var searchStr = $(this).val();
          updateAutocomplete(searchStr);

          if (event.keyCode === 13) {
            searchName = $(this).val();
            grabGoogleData(searchName, pointofInterestQuery, apiKeyArray[currentIndex])
            $('#search').val("");
          }
    });

    // Initialize side menu
    $(".button-collapse").sideNav();

    // Close side menu
    $('#closeMenu').on("click", function(event) {
        $(".button-collapse").sideNav('hide');
    });

    // Functions for initializing viewing options on drop down menu
    $('#pointsofInterest').on("click", function(event) {
        grabGoogleData(searchName, pointofInterestQuery, apiKeyArray[currentIndex])
    });
    $('#restaurants').on("click", function(event) {
        grabGoogleData(searchName, restaurantQuery, apiKeyArray[currentIndex])
    });
    $('#hotels').on("click", function(event) {
        grabGoogleData(searchName, hotelQuery, apiKeyArray[currentIndex])
    });

    // Functions for initializing viewing options on side menu
    $('#pointsofInterestSideNav').on("click", function(event) {
        $(".button-collapse").sideNav('hide');
        grabGoogleData(searchName, pointofInterestQuery, apiKeyArray[currentIndex])
    });
    $('#restaurantsSideNav').on("click", function(event) {
        $(".button-collapse").sideNav('hide');
        grabGoogleData(searchName, restaurantQuery, apiKeyArray[currentIndex])
    });
    $('#hotelsSideNav').on("click", function(event) {
        $(".button-collapse").sideNav('hide');
        grabGoogleData(searchName, hotelQuery, apiKeyArray[currentIndex])
    });

    // Button functions for moving carousel and changing info and map cards
    $('#buttonForward').on("click", function(event) {
        $('.carousel').carousel('next');
        setTimeout(grabActiveImage, 300);
    });
    $('#buttonBack').on("click", function(event) {
        $('.carousel').carousel('prev');
        setTimeout(grabActiveImage, 300);
    });

    // Firebase functions
    var dataLoaded = false;

    // Firebase function that grabs most recent child after initial load, once a new search term is completed 
    database.ref().on("child_added", function(childSnapshot) {

        if (dataLoaded) {
            $('.recentSearches').empty();
            $('.recentSearches').html("Most recent search on TravelOn: ")
            var newDiv = $('<div>');
            newDiv.attr('id', 'searchDiv');
            var recentCities = $('<p>');
            recentCities.html(childSnapshot.val().searchCity);
            newDiv.prepend(recentCities);
            $('.recentSearches').append(newDiv);
        }
    })

    // Firebase function for intiial load only
    database.ref().once("value", function(snapshot) {

        var snapshotArray = []

        snapshot.forEach(function(data) {
            snapshotArray.push(data.val().searchCity)
        })

        $('.recentSearches').empty();
        $('.recentSearches').html("Most recent search on TravelOn: ")
        var newDiv = $('<div>');
        newDiv.attr('id', 'searchDiv');
        var recentCities = $('<p>');
        recentCities.html(snapshotArray[snapshotArray.length - 1]);
        newDiv.prepend(recentCities);
        $('.recentSearches').append(newDiv);

        dataLoaded = true

    })

});

// Google API function 
function grabGoogleData(location, query, apiKey) {
    $('.photoCarousel').empty();
    $('.info').empty();
    $('#map').empty();
    var geoplacesApiURL = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + location + query + "&language=en&key=" + apiKey;
    var newURL = cors_api_url + geoplacesApiURL;
    var counter = 0;
    var counterList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    var carousel = $('<div>');
    carousel.attr('class', 'carousel carousel-slider center');
    carousel.attr('data-indicators', 'true');
    $.ajax({
         url:newURL,
         async: false,
         method:'GET'
     }).then(function(response) {

         var resultList = response.results;

         // If API Key does not work, will loop through the API Key index to find one that does
         if (resultList.length === 0) {
             currentIndex ++
             grabGoogleData(location, query, apiKeyArray[currentIndex]);
         }

         // Only returning 10 values
         for (var i = 0; i < 10; i ++) {
            var photoReference = resultList[i].photos[0].photo_reference;
            var placeText = resultList[i].name;
            var placeRating = resultList[i].rating;
            
            // Adding images to carousel with text 
            var newImage = $('<img>');
            var src = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&maxheight=500&photoreference=" + photoReference + "&key=" + apiKey;
            newImage.attr('src', src);
            var newText = $('<p>');
            newText.attr('class', 'photoText')
            newText.html(placeText);
            var newCarousel = $("<a>");
            newCarousel.attr('class', 'carousel-item')
            newCarousel.attr('href', '#' + counterList[counter] + '!');
            newCarousel.attr('id', placeText);
            newCarousel.append(newImage);
            newCarousel.append(newText);
            carousel.append(newCarousel);
            
            // Adding info to info card
            var titleSub = ""
            if (query === " point of interest") {
                titleSub = "Top Points of Interests in "
            }
            else if (query === " restaurant") {
                titleSub = "Top Restaurants in "
            }
            else if (query === " hotel") {
                titleSub = "Top Hotels in "
            }
            $('.titleInfo').html(titleSub + location);
            var newInfoDiv = $('<div>');
            newInfoDiv.attr('class', 'cityInfo');
            newInfoDiv.attr('id', '#' + counterList[counter] + '!');
            var newTitle = $('<h5>');
            newTitle.attr('id', 'newPlaceTitle')
            newTitle.html(placeText);
            var newOpen = $('<h6>');
            newOpen.attr('id', 'newPlaceOpen')

            // Option if place does not include hours 
            if (resultList[i].opening_hours) {
                var placeOpen = resultList[i].opening_hours.open_now;
                
                if (placeOpen == true) {
                    newOpen.html("Open now")
                }
                else {
                    newOpen.html("Not open now")
                }
            }
            else {
                newOpen.html("Always open")
            }
            newTitle.append(newOpen);
            var newRating = $('<h6>');
            newRating.attr('id', 'newPlaceRating')
            newRating.html('Average user rating: ' + placeRating);
            newTitle.append(newRating);
            newInfoDiv.append(newTitle);
            $('.info').append(newInfoDiv);
            counter ++;
         }

        counter = 0;
        $('.mapLocation').html("Map of " + location);
        $('.photoCarousel').append(carousel);
        $('.carousel.carousel-slider').carousel({fullWidth:true, indicators:false});

        // Call active image and weather functions
        grabActiveImage();
        grabWeatherData();

        // Push search location into Firebase, only if not default search
        if (searchName != "Minneapolis") {

            var newCity= database.ref().push();

            newCity.set({
                searchCity: searchName
            })
        }

     });
}

// Function highlights information for current image being displayed and creates embedded Google Map with marker 
function grabActiveImage() {
    $('#map').empty();
    // Find parameters of carousel image
    $('.cityInfo').attr('style', "background-color: none")
    var activePhoto = $('a.carousel-item.active');
    var hrefValue = activePhoto[0].hash;
    var textValue = activePhoto[0].id;

    // Highlight info in card whose id matches the image href value
    var textAttr = $('.cityInfo[id="' + hrefValue + '"]');
    textAttr.attr('style', "background-color: rgba(77,167,203,1)");

    // Create embedded map with marker for search location in image
    var newFrame = $('<iframe>');
    newFrame.attr('width', '95%');
    newFrame.attr('height', '500');
    newFrame.attr('frameborder', '0');
    newFrame.attr('style', 'border:0');
    newFrame.attr('src', 'https://www.google.com/maps/embed/v1/place?q=' + textValue  + ',' + searchName + '&key=' + geoMapsEmbedApiKey);
    newFrame.attr('allowfullscreen');
    $('#map').append(newFrame);
}

// Function for autocomplete 
function updateAutocomplete(searchStr) {
  var availableTags = {};
  
  jQuery.getJSON("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?key=" + "AIzaSyDfhVC4Hbd8rWHg1IrIONTu7BXot7liwq8" + "&input=" + searchStr)
    .done(function(response) {

            for (var i=0; i < response.predictions.length; i++) {
                // Only return autocomplete suggestions that are cities or countries
                if ( (response.predictions[i].types[0] === "locality") || (response.predictions[i].types[0] === "country") ) {
                    var options = response.predictions[i].description;
                    availableTags[options]=null;
                }
            }

        $('#search').autocomplete({
            data: availableTags,
            limit: 40, // The max amount of results that can be shown at once. Default: Infinity.
            minLength: 1,
          onAutocomplete: function(data) {
            // Callback function when value is autocompleted, to complete search location
            search = String(data);
            searchString = search.split(",");
            searchName = searchString[0];
            grabGoogleData(searchName, pointofInterestQuery, apiKeyArray[currentIndex]);
            $('#search').val("");
          },
        });
    });

}

// Function to grab weather data of current search lcoation and display it
function grabWeatherData () {
    $('.weather').empty();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchName +
    "&APPID=7aea8d220d0b2f4f285d3790fe8b6d9f";
    $.ajax({
    url: queryURL,
    method: "GET"
    }).done(function(response) {
        // Current weather conditions
        var currentWeather = response.weather[0].main;
        // Convert current temp to nearest value in fahrenheit
        var currentTemp = Math.floor((response.main.temp * (9/5)) - 459.67);
        
        // Append weather information to weather div
        var weatherDiv = $('<div>');
        var title = $('<h4>');
        title.attr('id', 'weatherTitle');
        title.html(searchName );
        var weather = $('<h6>');
        weather.attr('id', 'weatherCond');
        weather.html("Weather Conditions: " + currentWeather);
        var temp = $('<h6>');
        temp.attr('id', 'weatherTemp');
        temp.html("Current Temperature: " + currentTemp + "°F");
        weatherDiv.append(title);
        weatherDiv.append(weather);
        weatherDiv.append(temp);
        $('.weather').append(weatherDiv);
    });
}
