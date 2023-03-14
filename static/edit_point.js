function initMap() {
  var map = L.map("map").setView([56.946285, 24.105078], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    noWrap: true,
    bounds: [
      [-90, -180],
      [90, 180],
    ],
    minZoom: 3,
  }).addTo(map);
  var southWest = L.latLng(-90, -180);
  var northEast = L.latLng(90, 180);
  var bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);
  var markers = [];

  map.on("click", function (e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    if (markers.length > 0) {
      // if markers exist, remove the last one from the map and array
      var lastMarker = markers.pop();
      map.removeLayer(lastMarker);
    } else {
      // if no markers exist, create a new marker and add it to the map and array
      var newMarker = L.marker(e.latlng).addTo(map);
      markers.push(newMarker);
      document.getElementById("latitude").value = lat;
      document.getElementById("longitude").value = lng;
    }
  });
  const badWords = [
    "cunt",
    "fuck",
    "kys",
    "retard",
    "nigg",
    "nigger",
    "nigga",
    "fuck",
    "fucker",
    "niger",
    "N1gger",
    "nigge",
    "niggers",
    "kysretard",
    "kill your self",
    "idiot",
  ];

  const inputField = document.getElementById("name");
  const submitButton = document.getElementById("finish");
  const textarea = document.getElementById("description");
  const alertBox = document.getElementById("alertBox");

  const checkForBadWords = function () {
    const inputValue = inputField.value.toLowerCase();
    const textareaValue = textarea.value.toLowerCase();
    let hasBadWords = false;

    for (let i = 0; i < badWords.length; i++) {
      const badWord = badWords[i];
      const regex = new RegExp("\\b" + badWord + "\\b", "gi");
      if (regex.test(inputValue) || regex.test(textareaValue)) {
        hasBadWords = true;
        break;
      }
    }

    submitButton.disabled = hasBadWords;
    alertBox.style.display = hasBadWords ? "block" : "none";
  };

  inputField.addEventListener("input", checkForBadWords);
  textarea.addEventListener("input", checkForBadWords);
}
