// Need in for cycle when putting markers on the map
let postCount;
// Puts in variable post count in db
async function getDataCount() {
  fetch("/get_data_count")
    .then((response) => response.json())
    .then((data) => {
      postCount = data.count;
      getData();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Map creation and options for it
var map = L.map("map").setView([56.946285, 24.105078], 7);

var baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  noWrap: true,
  bounds: [
    [-90, -180],
    [90, 180],
  ],
  minZoom: 3,
}).addTo(map);

// Go to specific marker when button is pressed
function goToMarker(latitude, longitude) {
  x = map.setView([latitude, longitude], 16);
}

// Point custom icons
var charityIcon = L.icon({
  iconUrl: "/static/icons/charityicon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

var warningIcon = L.icon({
  iconUrl: "/static/icons/warningicon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

var concertIcon = L.icon({
  iconUrl: "/static/icons/concerticon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

var meetupIcon = L.icon({
  iconUrl: "/static/icons/meetupicon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

var roadWorkIcon = L.icon({
  iconUrl: "/static/icons/roadworksicon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

var otherIcon = L.icon({
  iconUrl: "/static/icons/othericon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Sets map range to user
var southWest = L.latLng(-90, -180);
var northEast = L.latLng(90, 180);
var bounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(bounds);

// Each layer cluster group
let postLatitude, postLongitude;
var charityLayer = L.markerClusterGroup();
var warningLayer = L.markerClusterGroup();
var concertLayer = L.markerClusterGroup();
var otherLayer = L.markerClusterGroup();
var meetupLayer = L.markerClusterGroup();
var roadWorkLayer = L.markerClusterGroup();
var overlayMaps = {
  Charity: charityLayer,
  Concert: concertLayer,
  Meetup: meetupLayer,
  Other: otherLayer,
  "Road work": roadWorkLayer,
  Warning: warningLayer,
};
var layerControl = L.control.layers(null, overlayMaps).addTo(map);

// Fetch data about points and put them on map with all information
async function getData() {
  await fetch("/get_data")
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < postCount; i++) {
        switch (data[i]["type"]) {
          case "Charity": {
            postLatitude = data[i]["latitude"];
            postLongitude = data[i]["longitude"];
            x = L.marker([postLatitude, postLongitude], {
              icon: charityIcon,
            }).bindPopup(
              "ID: " +
                data[i]["_id"] +
                "<br> Name: " +
                data[i]["name"] +
                "<br> Description: " +
                data[i]["description"] +
                "<br> Post date: " +
                data[i]["postdate"] +
                "<br> End date: " +
                data[i]["removedate"] +
                "<br> Type: " +
                data[i]["type"] +
                "<br> Author: " +
                data[i]["author"] +
                "<br><form action='/report_marker/" +
                data[i]["_id"] +
                "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
            );
            charityLayer.addLayer(x);
            x.on("click", function (e) {
              map.setView(e.latlng, 16);
            });
            break;
          }

          case "Warning": {
            postLatitude = data[i]["latitude"];
            postLongitude = data[i]["longitude"];
            x = L.marker([postLatitude, postLongitude], {
              icon: warningIcon,
            }).bindPopup(
              "ID: " +
                data[i]["_id"] +
                "<br> Name: " +
                data[i]["name"] +
                "<br> Description: " +
                data[i]["description"] +
                "<br> Post date: " +
                data[i]["postdate"] +
                "<br> End date: " +
                data[i]["removedate"] +
                "<br> Type: " +
                data[i]["type"] +
                "<br> Author: " +
                data[i]["author"] +
                "<br><form action='/report_marker/" +
                data[i]["_id"] +
                "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
            );
            warningLayer.addLayer(x);
            x.on("click", function (e) {
              map.setView(e.latlng, 16);
            });
            break;
          }

          case "Concert": {
            postLatitude = data[i]["latitude"];
            postLongitude = data[i]["longitude"];
            x = L.marker([postLatitude, postLongitude], {
              icon: concertIcon,
            }).bindPopup(
              "ID: " +
                data[i]["_id"] +
                "<br> Name: " +
                data[i]["name"] +
                "<br> Description: " +
                data[i]["description"] +
                "<br> Post date: " +
                data[i]["postdate"] +
                "<br> End date: " +
                data[i]["removedate"] +
                "<br> Type: " +
                data[i]["type"] +
                "<br> Author: " +
                data[i]["author"] +
                "<br><form action='/report_marker/" +
                data[i]["_id"] +
                "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
            );
            concertLayer.addLayer(x);
            x.on("click", function (e) {
              map.setView(e.latlng, 16);
            });
            break;
          }

          case "Meetup": {
            postLatitude = data[i]["latitude"];
            postLongitude = data[i]["longitude"];
            x = L.marker([postLatitude, postLongitude], {
              icon: meetupIcon,
            }).bindPopup(
              "ID: " +
                data[i]["_id"] +
                "<br> Name: " +
                data[i]["name"] +
                "<br> Description: " +
                data[i]["description"] +
                "<br> Post date: " +
                data[i]["postdate"] +
                "<br> End date: " +
                data[i]["removedate"] +
                "<br> Type: " +
                data[i]["type"] +
                "<br> Author: " +
                data[i]["author"] +
                "<br><form action='/report_marker/" +
                data[i]["_id"] +
                "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
            );
            meetupLayer.addLayer(x);
            x.on("click", function (e) {
              map.setView(e.latlng, 16);
            });
            break;
          }

          case "Road work": {
            postLatitude = data[i]["latitude"];
            postLongitude = data[i]["longitude"];
            x = L.marker([postLatitude, postLongitude], {
              icon: roadWorkIcon,
            }).bindPopup(
              "ID: " +
                data[i]["_id"] +
                "<br> Name: " +
                data[i]["name"] +
                "<br> Description: " +
                data[i]["description"] +
                "<br> Post date: " +
                data[i]["postdate"] +
                "<br> End date: " +
                data[i]["removedate"] +
                "<br> Type: " +
                data[i]["type"] +
                "<br> Author: " +
                data[i]["author"] +
                "<br><form action='/report_marker/" +
                data[i]["_id"] +
                "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
            );
            roadWorkLayer.addLayer(x);
            x.on("click", function (e) {
              map.setView(e.latlng, 16);
            });
            break;
          }
          case "Other": {
            postLatitude = data[i]["latitude"];
            postLongitude = data[i]["longitude"];
            x = L.marker([postLatitude, postLongitude], {
              icon: otherIcon,
            }).bindPopup(
              "ID: " +
                data[i]["_id"] +
                "<br> Name: " +
                data[i]["name"] +
                "<br> Description: " +
                data[i]["description"] +
                "<br> Post date: " +
                data[i]["postdate"] +
                "<br> End date: " +
                data[i]["removedate"] +
                "<br> Type: " +
                data[i]["type"] +
                "<br> Author: " +
                data[i]["author"] +
                "<br><form action='/report_marker/" +
                data[i]["_id"] +
                "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
            );
            otherLayer.addLayer(x);
            x.on("click", function (e) {
              map.setView(e.latlng, 16);
            });
            break;
          }
        }
      }
      async function getUserSettings() {
        await fetch("/user_settings_data")
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              otherLayer.addTo(map);
              concertLayer.addTo(map);
              charityLayer.addTo(map);
              warningLayer.addTo(map);
              meetupLayer.addTo(map);
              roadWorkLayer.addTo(map);
            } else {
              for (let i = 0; i < 6; i++) {
                if (data[i] == "Charity") {
                  charityLayer.addTo(map);
                }
                if (data[i] == "Meetup") {
                  meetupLayer.addTo(map);
                }
                if (data[i] == "Warning") {
                  warningLayer.addTo(map);
                }
                if (data[i] == "Other") {
                  otherLayer.addTo(map);
                }
                if (data[i] == "Concert") {
                  concertLayer.addTo(map);
                }
                if (data[i] == "Road work") {
                  roadWorkLayer.addTo(map);
                }
              }
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
      getUserSettings();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
