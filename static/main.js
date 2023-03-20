let postCount;
async function getDataCount() {
  fetch("/get_data_count")
    .then((response) => response.json())
    .then((data) => {
      postCount = data.count;
      console.log(postCount);
      // fetch("/get_data");
      getData();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

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

var southWest = L.latLng(-90, -180);
var northEast = L.latLng(90, 180);
var bounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(bounds);

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

async function getData() {
  await fetch("/get_data")
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < postCount; i++) {
        if (data["documents"][i]["type"] == "Charity") {
          postLatitude = data["documents"][i]["latitude"];
          postLongitude = data["documents"][i]["longitude"];
          x = L.marker([postLatitude, postLongitude], {
            icon: charityIcon,
          }).bindPopup(
            "ID: " +
              data["documents"][i]["_id"] +
              "<br> Name: " +
              data["documents"][i]["name"] +
              "<br> Description: " +
              data["documents"][i]["description"] +
              "<br> Post date: " +
              data["documents"][i]["postdate"] +
              "<br> End date: " +
              data["documents"][i]["removedate"] +
              "<br> Type: " +
              data["documents"][i]["type"] +
              "<br> Author: " +
              data["documents"][i]["author"] +
              "<br><form action='/report_marker/" +
              data["documents"][i]["_id"] +
              "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
          );
          charityLayer.addLayer(x);
          x.on("click", function (e) {
            map.setView(e.latlng, 16);
          });
        }
        if (data["documents"][i]["type"] == "Warning") {
          postLatitude = data["documents"][i]["latitude"];
          postLongitude = data["documents"][i]["longitude"];
          x = L.marker([postLatitude, postLongitude], {
            icon: warningIcon,
          }).bindPopup(
            "ID: " +
              data["documents"][i]["_id"] +
              "<br> Name: " +
              data["documents"][i]["name"] +
              "<br> Description: " +
              data["documents"][i]["description"] +
              "<br> Post date: " +
              data["documents"][i]["postdate"] +
              "<br> End date: " +
              data["documents"][i]["removedate"] +
              "<br> Type: " +
              data["documents"][i]["type"] +
              "<br> Author: " +
              data["documents"][i]["author"] +
              "<br><form action='/report_marker/" +
              data["documents"][i]["_id"] +
              "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
          );
          warningLayer.addLayer(x);
          x.on("click", function (e) {
            map.setView(e.latlng, 16);
          });
        }
        if (data["documents"][i]["type"] == "Concert") {
          postLatitude = data["documents"][i]["latitude"];
          postLongitude = data["documents"][i]["longitude"];
          x = L.marker([postLatitude, postLongitude], {
            icon: concertIcon,
          }).bindPopup(
            "ID: " +
              data["documents"][i]["_id"] +
              "<br> Name: " +
              data["documents"][i]["name"] +
              "<br> Description: " +
              data["documents"][i]["description"] +
              "<br> Post date: " +
              data["documents"][i]["postdate"] +
              "<br> End date: " +
              data["documents"][i]["removedate"] +
              "<br> Type: " +
              data["documents"][i]["type"] +
              "<br> Author: " +
              data["documents"][i]["author"] +
              "<br><form action='/report_marker/" +
              data["documents"][i]["_id"] +
              "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
          );
          concertLayer.addLayer(x);
          x.on("click", function (e) {
            map.setView(e.latlng, 16);
          });
        }
        if (data["documents"][i]["type"] == "Meetup") {
          postLatitude = data["documents"][i]["latitude"];
          postLongitude = data["documents"][i]["longitude"];
          x = L.marker([postLatitude, postLongitude], {
            icon: meetupIcon,
          }).bindPopup(
            "ID: " +
              data["documents"][i]["_id"] +
              "<br> Name: " +
              data["documents"][i]["name"] +
              "<br> Description: " +
              data["documents"][i]["description"] +
              "<br> Post date: " +
              data["documents"][i]["postdate"] +
              "<br> End date: " +
              data["documents"][i]["removedate"] +
              "<br> Type: " +
              data["documents"][i]["type"] +
              "<br> Author: " +
              data["documents"][i]["author"] +
              "<br><form action='/report_marker/" +
              data["documents"][i]["_id"] +
              "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
          );
          meetupLayer.addLayer(x);
          x.on("click", function (e) {
            map.setView(e.latlng, 16);
          });
        }
        if (data["documents"][i]["type"] == "Road work") {
          postLatitude = data["documents"][i]["latitude"];
          postLongitude = data["documents"][i]["longitude"];
          x = L.marker([postLatitude, postLongitude], {
            icon: roadWorkIcon,
          }).bindPopup(
            "ID: " +
              data["documents"][i]["_id"] +
              "<br> Name: " +
              data["documents"][i]["name"] +
              "<br> Description: " +
              data["documents"][i]["description"] +
              "<br> Post date: " +
              data["documents"][i]["postdate"] +
              "<br> End date: " +
              data["documents"][i]["removedate"] +
              "<br> Type: " +
              data["documents"][i]["type"] +
              "<br> Author: " +
              data["documents"][i]["author"] +
              "<br><form action='/report_marker/" +
              data["documents"][i]["_id"] +
              "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
          );
          roadWorkLayer.addLayer(x);
          x.on("click", function (e) {
            map.setView(e.latlng, 16);
          });
        }
        if (data["documents"][i]["type"] == "Other") {
          postLatitude = data["documents"][i]["latitude"];
          postLongitude = data["documents"][i]["longitude"];
          x = L.marker([postLatitude, postLongitude], {
            icon: otherIcon,
          }).bindPopup(
            "ID: " +
              data["documents"][i]["_id"] +
              "<br> Name: " +
              data["documents"][i]["name"] +
              "<br> Description: " +
              data["documents"][i]["description"] +
              "<br> Post date: " +
              data["documents"][i]["postdate"] +
              "<br> End date: " +
              data["documents"][i]["removedate"] +
              "<br> Type: " +
              data["documents"][i]["type"] +
              "<br> Author: " +
              data["documents"][i]["author"] +
              "<br><form action='/report_marker/" +
              data["documents"][i]["_id"] +
              "'> <button type='submit' class='btn btn-danger'>Report marker</button></form>"
          );
          otherLayer.addLayer(x);
          x.on("click", function (e) {
            map.setView(e.latlng, 16);
          });
        }
      }
      async function getUserSettings() {
        await fetch("/user_settings_data")
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
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
      // getTypes();
      getUserSettings();
      // Push all Layers into map and show them on map load
      // otherLayer.addTo(map);
      // concertLayer.addTo(map);
      // charityLayer.addTo(map);
      // warningLayer.addTo(map);
      // meetupLayer.addTo(map);
      // roadWorkLayer.addTo(map);

      console.log("Marker data loaded!");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
