const togglePasswords = document.getElementById("togglePasswords");
const passwords = document.getElementById("passwords");
const passwordIcons = document.getElementById("passwordIcons");

togglePasswords.addEventListener("click", function () {
  const type = passwords.getAttribute("type") === "password" ? "text" : "password";
  passwords.setAttribute("type", type);
  passwordIcons.classList.toggle("mdi-eye");
  passwordIcons.classList.toggle("mdi-eye-off");
});

const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const passwordIcon = document.getElementById("passwordIcon");

togglePassword.addEventListener("click", function () {
  const type = password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  passwordIcon.classList.toggle("mdi-eye");
  passwordIcon.classList.toggle("mdi-eye-off");
});

// Toggle Confirm Password Visibility
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordIcon = document.getElementById("confirmPasswordIcon");

toggleConfirmPassword.addEventListener("click", function () {
  const type = confirmPassword.getAttribute("type") === "password" ? "text" : "password";
  confirmPassword.setAttribute("type", type);
  confirmPasswordIcon.classList.toggle("mdi-eye");
  confirmPasswordIcon.classList.toggle("mdi-eye-off");
});

// Validate if Password and Confirm Password Match
confirmPassword.addEventListener("input", function () {
  if (password.value !== confirmPassword.value) {
    passwordError.classList.remove("hidden");
  } else {
    passwordError.classList.add("hidden");
  }
});
