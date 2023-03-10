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
