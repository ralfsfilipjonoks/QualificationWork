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

  const postDateInput = document.getElementById("postdate");
  const removeDateInput = document.getElementById("removedate");
  const postTextInput = document.getElementById("name");
  const postDescInput = document.getElementById("description");
  const submitButton = document.getElementById("add-point");
  const notificationDiv = document.getElementById("notification");

  function checkInputs() {
    const postDate = new Date(postDateInput.value);
    const removeDate = new Date(removeDateInput.value);
    const postText = postTextInput.value.toLowerCase();
    const postDesc = postDescInput.value.toLowerCase();
    let notification = "";

    // Check if post date is before remove date
    if (postDate > removeDate) {
      notification = "Post date must be before remove date.";
    }

    // Check for bad words in post text
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
      "Nigers",
      "gejs",
      "pimpis",
    ];
    for (const word of badWords) {
      if (postText.includes(word)) {
        notification = "Name contains a bad word.";
        break;
      }
      if (postDesc.includes(word)) {
        notification = "Description contains a bad word.";
        break;
      }
    }

    // Show or hide notification
    if (notification) {
      notificationDiv.textContent = notification;
      notificationDiv.style.display = "block";
      submitButton.disabled = true;
    } else {
      notificationDiv.style.display = "none";
      submitButton.disabled = false;
    }
  }
  postDateInput.addEventListener("input", checkInputs);
  removeDateInput.addEventListener("input", checkInputs);
  postDescInput.addEventListener("input", checkInputs);
  postTextInput.addEventListener("input", checkInputs);

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
}
