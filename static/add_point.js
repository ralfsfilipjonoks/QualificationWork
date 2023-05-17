getTypes();
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
}

const form = $("#name").closest("form");

const validateInput = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex =
    /^[a-zA-Z0-9_!@#$%^&*()\-\+=\[\]{};:'",.<>\/?\\| \u{0100}-\u{017F}]{3,50}$/u;

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} must be between 3 and 50 characters!`);
  }

  if (errors.length > 0) {
    input.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }
  input.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

const validateDescription = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex =
    /^[a-zA-Z0-9_!@#$%^&*()\-\+=\[\]{};:'",.<>\/?\\|\s\u{0100}-\u{017F}]{10,100}$/u;

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} must be between 10 and 100 characters!`);
  }

  if (errors.length > 0) {
    input.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }
  input.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

const validatePostDate = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} format has to be YYYY-MM-DD.`);
  }

  if (errors.length > 0) {
    input.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }
  input.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

const validateRemoveDate = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex = /^\d{4}-\d{2}-\d{2}$/;

  const enteredDate = new Date(value);
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const postdate = new Date(postDateInput.val());

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} format has to be YYYY-MM-DD.`);
  }

  if (postdate > enteredDate) {
    errors.push("Please enter a remove date that is after the post date.");
  }

  if (enteredDate < currentDate) {
    errors.push("Please enter a valid date after today.");
  }

  if (errors.length > 0) {
    input.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }

  input.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

const validateLatitude = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} latitude coordinates error`);
  }

  if (errors.length > 0) {
    input.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }

  input.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

const validateLongitude = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex = /^[-+]?((1[0-7]|[1-9])?\d(\.\d+)?|180(\.0+)?)$/;

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} longitude coordinates error`);
  }

  if (errors.length > 0) {
    input.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }

  input.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

let allowedValues;
async function getTypes() {
  fetch("/get_point_types")
    .then((response) => response.json())
    .then((data) => {
      const types = data.documents.map((obj) => obj.type);

      // Define the allowed values
      allowedValues = types;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

const validateType = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];
  value.toString();

  if (allowedValues.includes(value)) {
  } else {
    errors.push(`Type value can\'t be changed in inspect element!`);
  }

  if (errors.length > 0) {
    input.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }

  input.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

const createErrorElement = () =>
  $(
    '<div class="alert alert-danger mt-2" role="alert" style="display: none;"></div>'
  );

const nameInput = $("#name");
const descriptionInput = $("#description");
const postDateInput = $("#postdate");
const removeDateInput = $("#removedate");
const latitudeInput = $("#latitude");
const longitudeInput = $("#longitude");
const typeInput = $("#type");

const nameErrorElement = createErrorElement();
const descriptionErrorElement = createErrorElement();
const postDateErrorElement = createErrorElement();
const removeDateErrorElement = createErrorElement();
const latitudeErrorElement = createErrorElement();
const longitudeErrorElement = createErrorElement();
const typeErrorElement = createErrorElement();

form.append(
  nameErrorElement,
  descriptionErrorElement,
  postDateErrorElement,
  removeDateErrorElement,
  latitudeErrorElement,
  longitudeErrorElement,
  typeErrorElement
);

nameInput.on("blur", () => validateInput(nameInput, nameErrorElement));
descriptionInput.on("blur", () =>
  validateDescription(descriptionInput, descriptionErrorElement)
);
postDateInput.on("blur", () =>
  validatePostDate(postDateInput, postDateErrorElement)
);
removeDateInput.on("blur", () =>
  validateRemoveDate(removeDateInput, removeDateErrorElement)
);
latitudeInput.on("blur", () =>
  validateLatitude(latitudeInput, latitudeErrorElement)
);
longitudeInput.on("blur", () =>
  validateLongitude(longitudeInput, longitudeErrorElement)
);
typeInput.on("blur", () => validateType(typeInput, typeErrorElement));

form.on("submit", (event) => {
  if (
    !validateInput(nameInput, nameErrorElement) ||
    !validateDescription(descriptionInput, descriptionErrorElement) ||
    !validatePostDate(postDateInput, postDateErrorElement) ||
    !validateRemoveDate(removeDateInput, removeDateErrorElement) ||
    !validateLatitude(latitudeInput, latitudeErrorElement) ||
    !validateLongitude(longitudeInput, longitudeErrorElement) ||
    !validateType(typeInput, typeErrorElement)
  ) {
    event.preventDefault();
    return false;
  }
});
