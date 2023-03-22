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
const otherPopupInput = document.getElementById("other-reason");
const descriptionInput = document.getElementById("report-description");
const submitReportButton = document.getElementById("submit_report");
const notificationDiv = document.getElementById("notification");

function checkInputs() {
  const otherPopupInputText = otherPopupInput.value.toLowerCase();
  const descriptionInputText = descriptionInput.value.toLowerCase();
  let notification = "";

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
  ];
  for (const word of badWords) {
    if (otherPopupInputText.includes(word)) {
      notification = "Report reason contains a bad word.";
      break;
    }
    if (descriptionInputText.includes(word)) {
      notification = "Description contains a bad word.";
      break;
    }
  }

  // Show or hide notification
  if (notification) {
    notificationDiv.textContent = notification;
    notificationDiv.style.display = "block";
    submitReportButton.disabled = true;
  } else {
    notificationDiv.style.display = "none";
    submitReportButton.disabled = false;
  }
}
otherPopupInput.addEventListener("input", checkInputs);
descriptionInput.addEventListener("input", checkInputs);
