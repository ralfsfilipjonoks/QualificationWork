function checkPasswordStrength() {
  let password = document.getElementById("password").value;
  let passwordStrengthBar = document.getElementById("passwordStrengthBar");
  let passwordStrengthText = document.getElementById("passwordStrengthText");
  let strength = 0;

  // Check if password meets length requirement
  if (password.length >= 8) {
    strength += 1;
  }

  // Check if password contains uppercase letter
  if (/[A-Z]/.test(password)) {
    strength += 1;
  }

  // Check if password contains lowercase letter
  if (/[a-z]/.test(password)) {
    strength += 1;
  }

  // Check if password contains number
  if (/\d/.test(password)) {
    strength += 1;
  }

  // Check if password contains special character
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    strength += 1;
  }

  // Set password strength bar and text based on strength score
  if (strength == 0) {
    passwordStrengthBar.style.width = "0%";
    passwordStrengthBar.classList.remove(
      "bg-danger",
      "bg-warning",
      "bg-info",
      "bg-success"
    );
    passwordStrengthText.innerHTML = "";
  } else if (strength == 1) {
    passwordStrengthBar.style.width = "20%";
    passwordStrengthBar.classList.remove("bg-warning", "bg-info", "bg-success");
    passwordStrengthBar.classList.add("bg-danger");
    passwordStrengthText.innerHTML = "Weak";
  } else if (strength == 2) {
    passwordStrengthBar.style.width = "40%";
    passwordStrengthBar.classList.remove("bg-info", "bg-success");
    passwordStrengthBar.classList.add("bg-warning");
    passwordStrengthText.innerHTML = "Moderate";
  } else if (strength == 3) {
    passwordStrengthBar.style.width = "60%";
    passwordStrengthBar.classList.remove("bg-success");
    passwordStrengthBar.classList.add("bg-info");
    passwordStrengthText.innerHTML = "Strong";
  } else if (strength == 4) {
    passwordStrengthBar.style.width = "100%";
    passwordStrengthBar.classList.remove("bg-danger", "bg-warning", "bg-info");
    passwordStrengthBar.classList.add("bg-success");
    passwordStrengthText.innerHTML = "Very Strong";
  }
}

const form = $("#name").closest("form");

const validateInput = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex = /^[\p{L}\s]{2,30}$/u;

  if (!regex.test(value)) {
    errors.push(
      `${input.attr(
        "name"
      )} should consist of 2 to 30 characters, allowing both uppercase and lowercase letters and spaces. Special characters and punctuation marks are not permitted.`
    );
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

const validateUsername = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const regex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!regex.test(value)) {
    errors.push(
      `${input.attr(
        "name"
      )} should be between 3 and 20 characters long, and it can only contain letters, numbers, and underscores (_).`
    );
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

const validateDateInput = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  const enteredDate = new Date(value);
  const currentDate = new Date();

  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(value)) {
    errors.push(`${input.attr("name")} format has to be YYYY-MM-DD.`);
  }

  if (enteredDate > currentDate) {
    errors.push(
      "Please provide a date of birth that is before the current date or valid date."
    );
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

const validatePasswordInput = (input, errorMsgs) => {
  const value = input.val();
  const errors = [];

  // Password length must be between 8 and 50 characters.
  if (value.length < 8 || value.length > 50) {
    errors.push("Password must be between 8 and 50 characters!");
  }

  // Password must have at least one uppercase, one lowercase, one number, and one symbol.
  if (!/[A-Z]/.test(value)) {
    errors.push("Password must contain at least one uppercase letter!");
  }
  if (!/[a-z]/.test(value)) {
    errors.push("Password must contain at least one lowercase letter!");
  }
  if (!/\d/.test(value)) {
    errors.push("Password must contain at least one number!");
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
    errors.push("Password must contain at least one symbol!");
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

const validateRepeatPasswordInput = (
  passwordInput,
  repeatPasswordInput,
  errorMsgs
) => {
  const value = repeatPasswordInput.val();
  const errors = [];

  // Check if repeat password matches password.
  if (value !== passwordInput.val()) {
    errors.push("Passwords do not match!");
  }

  if (errors.length > 0) {
    repeatPasswordInput.addClass("is-invalid");
    errorMsgs.html(
      `<ul class="mb-0">${errors
        .map((error) => `<li>${error}</li>`)
        .join("")}</ul>`
    );
    errorMsgs.show();
    return false;
  }

  repeatPasswordInput.removeClass("is-invalid");
  errorMsgs.hide().text("");
  return true;
};

const inputField = document.getElementById("name");
const counter = document.getElementById("counter");

inputField.addEventListener("input", function () {
  const inputLength = inputField.value.length;
  counter.textContent = inputLength;
});

const createErrorElement = () =>
  $(
    '<div class="alert alert-danger mt-2" role="alert" style="display: none;"></div>'
  );

const nameInput = $("#name");
const surnameInput = $("#surname");
const dateInput = $("#dateofbirth");
const usernameInput = $("#username");
const passwordInput = $("#password");
const repeatPasswordInput = $("#repeatpassword");

const nameErrorElement = createErrorElement();
const surnameErrorElement = createErrorElement();
const dateErrorElement = createErrorElement();
const usernameErrorElement = createErrorElement();
const passwordErrorElement = createErrorElement();
const repeatPasswordErrorElement = createErrorElement();

form.append(
  nameErrorElement,
  surnameErrorElement,
  dateErrorElement,
  usernameErrorElement,
  passwordErrorElement,
  repeatPasswordErrorElement
);
form.append(passwordErrorElement, repeatPasswordErrorElement);

nameInput.on("blur", () => validateInput(nameInput, nameErrorElement));
surnameInput.on("blur", () => validateInput(surnameInput, surnameErrorElement));
dateInput.on("blur", () => validateDateInput(dateInput, dateErrorElement));
usernameInput.on("blur", () =>
  validateUsername(usernameInput, usernameErrorElement)
);
passwordInput.on("blur", () =>
  validatePasswordInput(passwordInput, passwordErrorElement)
);
repeatPasswordInput.on("blur", () =>
  validateRepeatPasswordInput(
    passwordInput,
    repeatPasswordInput,
    repeatPasswordErrorElement
  )
);

form.on("submit", (event) => {
  if (
    !validateInput(nameInput, nameErrorElement) ||
    !validateInput(surnameInput, surnameErrorElement) ||
    !validateDateInput(dateInput, dateErrorElement) ||
    !validateUsername(usernameInput, usernameErrorElement) ||
    !validatePasswordInput(passwordInput, passwordErrorElement) ||
    !validateRepeatPasswordInput(
      passwordInput,
      repeatPasswordInput,
      repeatPasswordErrorElement
    )
  ) {
    event.preventDefault();
    return false;
  }
});
