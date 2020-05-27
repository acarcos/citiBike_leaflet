// For the Advance part, before creating the functions to visualize the station information,
// we will create like empty vasels to save the data and layers

// Tile Layer that will be the background of our map
var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: "pk.eyJ1IjoiY2hhcmNvcyIsImEiOiJja2FuNXE5YXUxbGRyMnFuc3c5dzRkamkxIn0.2IEQgoBPJmtVyxaXuGxBAQ"
    }); // Not added to the map yet

// Initialize LayerGroups that will host the station data
// according to number of bikes available
var layers = {
    COMING_SOON: new L.LayerGroup(),
    EMPTY: new L.LayerGroup(),
    LOW: new L.LayerGroup(),
    NORMAL: new L.LayerGroup(),
    OUT_OF_ORDER: new L.LayerGroup()
};

// Create the base map with the station layers
var map = L.map("map-id", {
    center: [40.73, -74.0059],
    zoom: 12,
    layers: [
        layers.COMING_SOON,
        layers.EMPTY,
        layers.LOW,
        layers.NORMAL,
        layers.OUT_OF_ORDER,
        lightmap // a ver si asi funciona jiji
    ]
});

// Overlays object to add to the layer control (the legend to switch layers)
var overlays = {
    "Coming Soon": layers.COMING_SOON,
    "Empty Stations": layers.EMPTY,
    "Low Stations": layers.LOW,
    "Healthy Stations": layers.NORMAL,
    "Out of Order": layers.OUT_OF_ORDER
};

// Create a control for overlays object
L.control.layers(null, overlays).addTo(map);

// Create a (empty) legend to display information about our map
var info = L.control({
    position: "bottomleft"
});

// When the legend control is added, insert a div (with .DomUtil) with the class "legend"
info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    return div;
};

// Add the info legend to the map
info.addTo(map);

// Initialize an object containing icons for each layer group
// These are personalize icons located on css and js
var icons = {
    COMING_SOON: L.ExtraMarkers.icon({
        icon: "ion-settings",
        iconColor: "white",
        markerColor: "yellow",
        shape: "penta"
    }),
    EMPTY: L.ExtraMarkers.icon({
        icon: "ion-android-bicycle",
        iconColor: "white",
        markerColor: "red",
        shape: "square"
    }),
    OUT_OF_ORDER: L.ExtraMarkers.icon({
        icon: "ion-minus-circled",
        iconColor: "white",
        markerColor: "blue-dark",
        shape: "penta"
    }),
    LOW: L.ExtraMarkers.icon({
        icon: "ion-android-bicycle",
        iconColor: "white",
        markerColor: "orange",
        shape: "square"
    }),
    NORMAL: L.ExtraMarkers.icon({
        icon: "ion-android-bicycle",
        iconColor: "white",
        markerColor: "green",
        shape: "star"
    })
};

// Now, we fill the previous layers and markers with data :)
// API call to the Citi Bike Station Information locations
d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json", function(infoRes) {
    console.log(infoRes);

    // Perform another call to the Citi Bike Station Status
    d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_status.json", function(statusRes) {
        console.log(statusRes);
        var updateAt = infoRes.last_updated;
        var stationStatus = statusRes.data.stations;
        var stationInfo = infoRes.data.stations;

        // Create an object to keep of the number of markers in each layer
        var stationCount = {
            COMING_SOON: 0,
            EMPTY: 0,
            LOW: 0,
            NORMAL: 0,
            OUT_OF_ORDER: 0
        };
    
        // Initialize stationStatusCode, used a key to access the appropiate layers,
        // icons, and station count for layer group
        var stationStatusCode;

        // Loop through the stations
        for (var i=0; i<stationInfo.length; i++) {
        
            // Create a new station object with properties of both station objects
            var station = Object.assign({}, stationInfo[i], stationStatus[i]);

            // If a station is listed but not installed, it is coming soon
            if (!station.is_installed) {
                stationStatusCode = "COMING_SOON";
            }
            // If a statioon has no bikes available, it is empty
            else if (!station.num_bikes_available) {
                stationStatusCode = "EMPTY";
            }
            // If a station is installed but is not renting, it is out of order
            else if (station.is_installed && !station.is_renting) {
                stationStatusCode = "OUT_OF_ORDER";
            }
            // If a station has less than 5 bikes, it's status is low
            else if (station.num_bikes_available < 5) {
                stationStatusCode = "LOW";
            }
            // Otherwise the station is normal
            else {
                stationStatusCode = "NORMAL";
            }

            // Update the station count (number of markers per each layer)
            stationCount[stationStatusCode]++;

            // Create a new marker with the appropiate icon and coordinates
            var newMarker = L.marker([station.lat, station.lon], {
                icon: icons[stationStatusCode]
            });

            // Add new marker to the appropiate layer
            newMarker.addTo(layers[stationStatusCode]);

            // Bind a popup to the marker that will display on click.
            // This will be rendered as HTML
            newMarker.bindPopup(station.name + "<br> Capacity: " + station.capacity + "<br>" + station.num_bikes_available + " Bikes Available");
        }

        // Call the updateLegend function
        updateLegend(updateAt, stationCount);

    });
});

// Update the legend's innerHTML with the last updated time and station count
function updateLegend(time, stationCount) {
    document.querySelector(".legend").innerHTML = [
        "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
        "<p class='out-of-order'>Out of Order Stations: " + stationCount.OUT_OF_ORDER + "</p>",
        "<p class='coming-soon'> Stations Coming Soon: " + stationCount.COMING_SOON + "</p>",
        "<p class='empty'>Empty Stations: " + stationCount.EMPTY + "</p>",
        "<p class='low'>Low Stations: " + stationCount.LOW + "</p>",
        "<p class='healthy'>Healthy Stations: " + stationCount.NORMAL + "</p>"
    ].join("");
}
