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
