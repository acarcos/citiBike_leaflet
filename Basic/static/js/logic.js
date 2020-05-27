
// BUILD A MAP
function createMap(bikeStations) {
    // Create the tile Layer, the base map
    var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: "pk.eyJ1IjoiY2hhcmNvcyIsImEiOiJja2FuNXE5YXUxbGRyMnFuc3c5dzRkamkxIn0.2IEQgoBPJmtVyxaXuGxBAQ"
    }); // Not added to the map yet

    // A baseMap object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap
    };

    // OverlayMaps object to hold the bikeStations layer
    var overlayMaps = {
        "Bike Stations": bikeStations
    };

    // The previous layers are helpful to display a legend to switch views

    // Map object, here we build the map with its layers
    var map = L.map("map-id", {
        center: [40.73, -74.0059],
        zoom: 12,
        layers: [lightmap, bikeStations]
    });

    // Layer control, using the baseMaps and overlayMaps.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
}

// CREATE MARKES FOR THE LOCATION OF BIKE STATIONS
function createMarkers(response) {
    console.log(response);
    // Get the stations info
    var stations = response.data.stations;

    // Array to hold bike markers
    var bikeMarkers = [];

    // Loop through the stations array
    for (var i=0; i<stations.length; i++) {
        var tempStation = stations[i];

        // For each station, a marker is createdd and a popup is binded with the station's name
        var bikeMarker = L.marker([tempStation.lat, tempStation.lon])
            .bindPopup("<h3>" + tempStation.name + "</h3> Capacity: " + tempStation.capacity);

        // Add marker to bikeMarkers array
        bikeMarkers.push(bikeMarker);
    }

    // Create a layer group using the bikeMarker array and call
        // createMap function
        var groupBikeMarker = L.layerGroup(bikeMarkers);
        createMap(groupBikeMarker);
}

// CALL BIKE API
d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json", createMarkers);

