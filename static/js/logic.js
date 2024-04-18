function createMap(earthquakes) {
    // Create the tile layer.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object to hold the streetmap layer.
    let baseMaps = {
        "Street Map": streetmap
    };

    // Create an overlayMaps object to hold the earthquake layer.
    let overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create the map object with options.
    let map = L.map("map", {
        center: [0, 0], // Default center
        zoom: 2, // Default zoom
        layers: [streetmap, earthquakes]
    });

    // Create a layer control.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    // Create a legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 50, 70, 90];
        let colors = [
            "#00FF00", // Shallow
            "#FFFF00",
            "#FFA500",
            "#FF4500",
            "#FF0000",
            "#8B0000" // Deep
        ];
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<span style="display: inline-block; width: 20px; height: 10px; background-color:' + colors[i] + '"></span> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(map);
}

function createMarkers(response) {
    // Pull the "features" property from response.
    let earthquakes = response.features;

    // Initialize an array to hold the earthquake markers.
    let earthquakeMarkers = [];

    // Loop through the earthquakes array.
    earthquakes.forEach(function (earthquake) {
        // Extract magnitude and depth
        let magnitude = earthquake.properties.mag;
        let depth = earthquake.geometry.coordinates[2];

        // Define marker size based on magnitude
        let markerSize = magnitude * 5;

        // Define marker color based on depth
        let markerColor = "";
        if (depth < 10) {
            markerColor = "#00FF00"; // Shallow
        } else if (depth < 30) {
            markerColor = "#FFFF00";
        } else if (depth < 50) {
            markerColor = "#FFA500";
        } else if (depth < 70) {
            markerColor = "#FF4500";
        } else if (depth < 90) {
            markerColor = "#FF0000";
        } else {
            markerColor = "#8B0000"; // Deep
        }

        // Create a circle marker, and bind a popup with earthquake details.
        let earthquakeMarker = L.circleMarker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]], {
            radius: markerSize,
            fillColor: markerColor,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<h3>${earthquake.properties.place}</h3><hr><p>Magnitude: ${magnitude}<br>Depth: ${depth}</p>`);

        // Add the marker to the earthquakeMarkers array.
        earthquakeMarkers.push(earthquakeMarker);
    });

    // Create a layer group.
    createMap(L.layerGroup(earthquakeMarkers));
}

// Perform an API call.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson").then(createMarkers);
