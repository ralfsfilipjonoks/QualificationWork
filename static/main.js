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

$(document).ready(function () {
  $("#login-form").submit(function (e) {
    e.preventDefault(); // Prevent form submission

    // Send AJAX request to server
    $.ajax({
      url: "/",
      type: "POST",
      data: $("#login-form").serialize(),
      success: function (response) {
        if (response.success) {
          // Credentials are correct, submit the form
          $("#login-form")[0].submit();
          window.location.href = "/";
        } else {
          // Credentials are incorrect, show error message
          $("#error-message").removeAttr("hidden");
          $("#error-message").text(response.message);
        }
      },
    });
  });
});

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
  id: "mapbox.streets",
}).addTo(map);

var satelliteLayer = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution:
      'Map data &copy; <a href="https://www.google.com/maps">Google Maps</a>',
    noWrap: true,
    bounds: [
      [-90, -180],
      [90, 180],
    ],
    minZoom: 3,
  }
);

var baseMaps = {
  "Street Map": baseLayer,
  "Satellite Map": satelliteLayer,
};

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
// map tools
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
layerControl.setPosition("bottomright", true);
//"Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')

// Fetch data about points and put them on map with all information
async function getData() {
  const response = await fetch("/get_data");
  const data = await response.json();
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
  for (let i = 0; i < postCount; i++) {
    const postLatitude = data[i].latitude;
    const postLongitude = data[i].longitude;
    const marker = L.marker([postLatitude, postLongitude], {
      icon:
        data[i].type === "Charity"
          ? charityIcon
          : data[i].type === "Warning"
          ? warningIcon
          : data[i].type === "Other"
          ? otherIcon
          : data[i].type === "Concert"
          ? concertIcon
          : data[i].type === "Meetup"
          ? meetupIcon
          : data[i].type === "Road work"
          ? roadWorkIcon
          : otherIcon,
    }).bindPopup(`
      <div class="container">
        <div class="row mb-2">
          <div class="col-12 text-center">
            <h5>${data[i].name}</h5>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-12">
            <p>${data[i].description}</p>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-sm-4 text-center">
            <strong>Post date:</strong> ${data[i].postdate}
          </div>
          <div class="col-sm-4 text-center">
            <strong>End date:</strong> ${data[i].removedate}
          </div>
          <div class="col-sm-4 text-center">
            <strong>Type:</strong> ${data[i].type}
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-12 text-center">
            <strong>Author:</strong> ${data[i].author}
            <br>
            <small class="text-muted">ID: ${data[i]._id}</small>
          </div>
        </div>
        <div class="row">
          <div class="col-4 text-center">
            <form action="/report_marker/${data[i]._id}">
              <button type="submit" class="btn btn-danger"><i class="bi bi-flag-fill"></i></button>
            </form>
          </div>
          <div class="col-4 text-center">
            <a href="https://www.google.com/maps?q=${postLatitude},${postLongitude}" target="_blank" class="btn btn-primary"><i class="bi bi-map-fill"></i></a>
          </div>
          <div class="col-4 text-center">
            <a href="https://www.waze.com/live-map?navigate=yes&lat=${postLatitude}&lon=${postLongitude}" target="_blank" class="btn btn-primary"><i class="bi bi-geo-alt-fill"></i></a>
          </div>
        </div>
      </div>
    `);

    switch (data[i].type) {
      case "Charity":
        charityLayer.addLayer(marker);
        break;
      case "Warning":
        warningLayer.addLayer(marker);
        break;
      case "Other":
        otherLayer.addLayer(marker);
        break;
      case "Concert":
        concertLayer.addLayer(marker);
        break;
      case "Meetup":
        meetupLayer.addLayer(marker);
        break;
      case "Road work":
        roadWorkLayer.addLayer(marker);
        break;
    }

    marker.on("click", function (event) {
      map.setView(event.latlng, 16);
    });
  }
}

var pointModalButton = L.DomUtil.create(
  "button",
  "btn btn-white btn-icon rounded-pill"
);
pointModalButton.innerHTML = '<i class="bi bi-geo-alt"></i> Points';
pointModalButton.setAttribute("data-bs-toggle", "offcanvas");
pointModalButton.setAttribute("data-bs-target", "#offcanvasScrolling");
pointModalButton.setAttribute("aria-controls", "offcanvasScrolling");
pointModalButton.setAttribute("style", "margin-right: 10px");

var aboutButton = L.DomUtil.create("button", "btn btn-white rounded-pill");
aboutButton.innerHTML = '<i class="bi bi-info-circle"></i> About';
aboutButton.setAttribute("style", "margin-right: 10px");
aboutButton.setAttribute("data-bs-toggle", "modal");
aboutButton.setAttribute("data-bs-target", "#aboutModal");

var loginButton = L.DomUtil.create("button", "btn btn-white rounded-pill");
loginButton.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Log in';
loginButton.setAttribute("data-bs-toggle", "modal");
loginButton.setAttribute("data-bs-target", "#loginModal");

var logoutButton = L.DomUtil.create("button", "btn btn-white rounded-pill");
logoutButton.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Log out';
logoutButton.addEventListener("click", function () {
  window.location.href = "/logout";
});

var userPointButton = L.DomUtil.create("button", "btn btn-white rounded-pill");
userPointButton.innerHTML = '<i class="bi bi-pin-map"></i> My markers';
userPointButton.setAttribute("style", "margin-right: 10px");
userPointButton.addEventListener("click", function () {
  window.location.href = "/user_points";
});

var addPointButton = L.DomUtil.create("button", "btn btn-white rounded-pill");
addPointButton.innerHTML = '<i class="bi bi-plus"></i> Add point';
addPointButton.setAttribute("style", "margin-right: 10px");
addPointButton.addEventListener("click", function () {
  window.location.href = "/add_point";
});

var controlPanel = L.control({ position: "topright" });

controlPanel.onAdd = function (map) {
  var container = L.DomUtil.create("div", "leaflet-bar my-custom-control");
  container.appendChild(aboutButton);
  container.appendChild(pointModalButton);
  container.appendChild(loginButton);
  return container;
};

controlPanel.addTo(map);

fetch("/get_session_info")
  .then((response) => response.json())
  .then((data) => {
    if (data.logged_in) {
      if (data.type == "user") {
        var userProfileButton = L.DomUtil.create(
          "button",
          "btn btn-white rounded-pill"
        );
        userProfileButton.innerHTML =
          '<i class="bi bi-person"></i> ' + data.username;
        userProfileButton.setAttribute("style", "margin-right: 10px");
        userProfileButton.addEventListener("click", function () {
          window.location.href = "/profile/" + data.username;
        });
        var container = document.getElementsByClassName("my-custom-control")[0];
        container.innerHTML = "";
        container.appendChild(userProfileButton);
        container.appendChild(addPointButton);
        container.appendChild(userPointButton);
        container.appendChild(aboutButton);
        container.appendChild(pointModalButton);
        container.appendChild(logoutButton);
      }
      if (data.type == "admin") {
        var adminButton = L.DomUtil.create("button", "btn btn-secondary");
        adminButton.innerHTML = data.username;
        adminButton.setAttribute("style", "margin-right: 10px");
        adminButton.addEventListener("click", function () {
          window.location.href = "/admin_ui";
        });
        var container = document.getElementsByClassName("my-custom-control")[0];
        container.innerHTML = "";
        container.appendChild(adminButton);
        container.appendChild(aboutButton);
        container.appendChild(pointModalButton);
        container.appendChild(logoutButton);
      }
    } else {
      // If user is not logged in, control already shows login button
    }
  });
