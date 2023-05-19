// JavaScript code
function toggleOtherInput() {
  const selectBox = document.getElementById("report-reason");
  const otherInput = document.getElementById("other-reason-input");

  if (selectBox.value === "other") {
    otherInput.style.display = "block";
  } else {
    otherInput.style.display = "none";
  }
}

const form = $("#report-reason").closest("form");

const validateReportReason = (input, errorMsgs) => {
  const value = input.val();
  value.toString();
  const errors = [];

  if (
    value !== "spam" &&
    value !== "inappropriate" &&
    value !== "offensive" &&
    value !== "other"
  ) {
    errors.push("value changed!");
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

const validateOtherReason = (input, errorMsgs) => {
  const value = input.val();
  value.toString();
  const errors = [];

  const regex =
    /^(?:|[a-zA-Z0-9_!@#$%^&*()\-\+=\[\]{};:'",.<>\/?\\| \u{0100}-\u{017F}]{3,30})$/u;

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} must be between 3 and 30 characters!`);
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

const createErrorElement = () =>
  $(
    '<div class="alert alert-danger mt-2" role="alert" style="display: none;"></div>'
  );

const reportReasonInput = $("#report-reason");
const otherReasonInput = $("#other-reason");
const reportDescriptionInput = $("#report-description");

const reportReasonErrorElement = createErrorElement();
const otherReasonErrorElement = createErrorElement();
const reportDescriptionErrorElement = createErrorElement();

form.append(
  reportReasonErrorElement,
  otherReasonErrorElement,
  reportDescriptionErrorElement
);

reportReasonInput.on("blur", () =>
  validateReportReason(reportReasonInput, reportReasonErrorElement)
);
otherReasonInput.on("blur", () =>
  validateOtherReason(otherReasonInput, otherReasonErrorElement)
);
reportDescriptionInput.on("blur", () =>
  validateOtherReason(reportDescriptionInput, reportDescriptionErrorElement)
);

form.on("submit", (event) => {
  if (
    !validateReportReason(reportReasonInput, reportReasonErrorElement) ||
    !validateOtherReason(otherReasonInput, otherReasonErrorElement) ||
    !validateDescription(reportDescriptionInput, reportDescriptionErrorElement)
  ) {
    event.preventDefault();
    return false;
  }
});
