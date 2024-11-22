$(document).ready(function () {
  const elements = {
    authModal: $("#authModal"),
    flipCard: $(".flip-card"),
    flipToSignup: $("#flipToSignup"),
    flipToSignin: $("#flipToSignin"),
    loginBtn: $("#loginBtn"),
    aboutBtn: $("#aboutBtn"),
    signInCloseBtn: $("#SignIn_closeBtn"),
    signUpCloseBtn: $("#SignUp_closeBtn"),
    signInForm: $("#signInForm"),
    signUpForm: $("#signUpForm"),
    termsLink: $("#termsLink"),
    termsText: $("#termsText"),
    termsCheckbox: $("#termsCheckbox"),
    submitButton: $("#submitButton"),
    passwordInput: $("#password"),
    confirmPasswordInput: $("#confirmPassword"),
    passwordError: $("#passwordError"),
    signUpError: $("#signUpError"),
    firstNameInput: $("#firstName"),
    lastNameInput: $("#lastName"),
    emailSignupInput: $("#email_signup"),
    phoneInput: $("#SignUp_phoneNum"),
    loginError: $("#loginError"),
    email_login: $("#email_login"),
    passwords: $("#passwords"),
    buttonText: $("#signUpButtonText"),
    buttonSpinner: $("#signUpButtonSpinner"),
    loginButtonText: $("#loginButtonText"),
    loginButtonSpinner: $("#loginButtonSpinner"),
    loginSubmitBtn: $("#signInForm button[type='submit']"),
    otpModal: $("#otpVerificationModal"),
    otpForm: $("#otpVerificationForm"),
    otpInput: $("#otp_input"),
    otpError: $("#otpError"),
    otpVerifyButton: $("#verifyOtpButton"),
    otpVerifyButtonText: $("#verifyButtonText"),
    otpVerifyButtonSpinner: $("#verifyButtonSpinner"),
    otpResendButton: $("#resendOtpButton"),
    otpCloseBtn: $("#otp_closeBtn"),
    signUpSuccess: $("#signUpSuccess"),
  };

  const validators = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    phone: (phone) => /^[0-9]{11}$/.test(phone),
    password: (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password),
  };

  // Error handling timeout variable
  let errorTimeout;

  // Helper functions
  function showError(message, errorElement = elements.signUpError) {
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    errorElement.text(message).removeClass("hidden").fadeIn(300);
    errorTimeout = setTimeout(() => {
      errorElement.fadeOut(300, function () {
        $(this).addClass("hidden").show();
      });
    }, 3000);
  }

  function clearError(errorElement = elements.signUpError) {
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    errorElement.text("").addClass("hidden");
  }

  function resetForms() {
    elements.signInForm.trigger("reset");
    elements.signUpForm.trigger("reset");
    clearError();
    clearError(elements.loginError);
    elements.email_login.removeClass("border-red-500");
    elements.passwords.removeClass("border-red-500");
  }

  function closeModal() {
    elements.authModal.addClass("hidden");
    resetForms();
  }

  // Sign in event handlers
  elements.email_login.on("input", function () {
    $(this).removeClass("border-red-500");
    clearError(elements.loginError);
    validateLoginFields();
  });

  elements.passwords.on("input", function () {
    $(this).removeClass("border-red-500");
    clearError(elements.loginError);
    validateLoginFields();
  });

  // Sign up field validation with auto-hide errors
  const signUpFields = [elements.firstNameInput, elements.lastNameInput, elements.emailSignupInput, elements.phoneInput, elements.passwordInput, elements.confirmPasswordInput];

  $.each(signUpFields, function (_, field) {
    field.on("input", function () {
      const $this = $(this);
      $this.removeClass("border-red-500");

      if (signUpFields.every((f) => $(f).val().trim())) {
        clearError();
      }

      // Show errors with auto-hide
      if ($this.is(elements.emailSignupInput) && $this.val() && !validators.email($this.val())) {
        showError("Please enter a valid email address");
        $this.addClass("border-red-500");
      } else if ($this.is(elements.phoneInput) && $this.val() && !validators.phone($this.val())) {
        showError("Please enter a valid 11-digit phone number");
        $this.addClass("border-red-500");
      } else if ($this.is(elements.passwordInput) && $this.val() && !validators.password($this.val())) {
        showError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
        $this.addClass("border-red-500");
      } else if ($this.is(elements.confirmPasswordInput)) {
        validatePasswords();
      }
    });

    // Clear error and red border when field gains focus
    field.on("focus", function () {
      $(this).removeClass("border-red-500");
      clearError();
    });
  });

  // Modal and card flip handlers
  elements.flipToSignup.on("click", function (e) {
    e.preventDefault();
    elements.flipCard.addClass("flipped");
  });

  elements.flipToSignin.on("click", function (e) {
    e.preventDefault();
    elements.flipCard.removeClass("flipped");
  });

  elements.loginBtn.on("click", () => elements.authModal.removeClass("hidden"));
  elements.aboutBtn.on("click", () => elements.authModal.removeClass("hidden"));
  elements.signInCloseBtn.on("click", closeModal);
  elements.signUpCloseBtn.on("click", closeModal);

  $(window).on("click", function (event) {
    if ($(event.target).is(elements.authModal)) closeModal();
  });

  // Terms and conditions handlers
  elements.termsLink.on("click", function (e) {
    e.preventDefault();
    elements.termsText.toggleClass("hidden");
  });

  elements.termsCheckbox.on("change", function () {
    const $submitButton = elements.submitButton;
    if (this.checked) {
      $submitButton.prop("disabled", false).removeClass("bg-gray-400 cursor-not-allowed").addClass("bg-black hover:bg-gray-900");
    } else {
      $submitButton.prop("disabled", true).removeClass("bg-black hover:bg-gray-900").addClass("bg-gray-400 cursor-not-allowed");
    }
  });

  function validateLoginFields() {
    const emailFilled = elements.email_login.val().trim();
    const passwordFilled = elements.passwords.val().trim();

    elements.loginSubmitBtn.prop("disabled", !(emailFilled && passwordFilled)).toggleClass("opacity-50 cursor-not-allowed", !(emailFilled && passwordFilled));
  }

  function validatePasswords() {
    const isValid = elements.passwordInput.val() === elements.confirmPasswordInput.val();
    if (!isValid) {
      showError("Passwords do not match");
    }
    elements.passwordError.toggleClass("hidden", isValid);
    elements.confirmPasswordInput.toggleClass("border-red-500", !isValid);
    return isValid;
  }

  // Form validation
  function validateLoginForm() {
    clearError(elements.loginError);

    elements.email_login.removeClass("border-red-500");
    elements.passwords.removeClass("border-red-500");

    let isValid = true;
    let errorMessage = [];

    if (!elements.email_login.val().trim()) {
      elements.email_login.addClass("border-red-500");
      errorMessage.push("Email is required");
      isValid = false;
    }

    if (!elements.passwords.val().trim()) {
      elements.passwords.addClass("border-red-500");
      errorMessage.push("Password is required");
      isValid = false;
    }

    if (!isValid) {
      showError(errorMessage.join(" and "), elements.loginError);
    }

    return isValid;
  }

  function validateForm() {
    clearError();

    const requiredFields = [
      { field: elements.firstNameInput, name: "First name" },
      { field: elements.lastNameInput, name: "Last name" },
      { field: elements.emailSignupInput, name: "Email" },
      { field: elements.phoneInput, name: "Phone number" },
      { field: elements.passwordInput, name: "Password" },
      { field: elements.confirmPasswordInput, name: "Confirm password" },
    ];

    for (const { field, name } of requiredFields) {
      if (!field.val().trim()) {
        showError(`${name} is required`);
        field.addClass("border-red-500");
        return false;
      }
      field.removeClass("border-red-500");
    }

    if (!validators.email(elements.emailSignupInput.val())) {
      showError("Please enter a valid email address");
      elements.emailSignupInput.addClass("border-red-500");
      return false;
    }

    if (!validators.phone(elements.phoneInput.val())) {
      showError("Please enter a valid 11-digit phone number");
      elements.phoneInput.addClass("border-red-500");
      return false;
    }

    if (!validators.password(elements.passwordInput.val())) {
      showError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
      elements.passwordInput.addClass("border-red-500");
      return false;
    }

    if (!validatePasswords()) return false;

    if (!elements.termsCheckbox.prop("checked")) {
      showError("Please accept the terms and conditions");
      return false;
    }

    return true;
  }

  // Form submissions
  function showOtpModal() {
    console.log("Showing OTP modal");
    elements.otpModal.removeClass("hidden").addClass("flex");
    elements.otpInput.val("");
    elements.otpError.addClass("hidden");
  }

  function hideOtpModal() {
    elements.otpModal.removeClass("flex").addClass("hidden");
  }

  function showOtpError(message) {
    elements.otpError.text(message).removeClass("hidden");
    setTimeout(() => {
      elements.otpError.addClass("hidden");
    }, 3000);
  }

  // Function to get CSRF token
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Sign Up Form Submission
  elements.signUpForm.on("submit", async function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    elements.buttonText.addClass("hidden");
    elements.buttonSpinner.removeClass("hidden");
    elements.submitButton.prop("disabled", true);

    try {
      const formData = {
        user_firstname: elements.firstNameInput.val().trim(),
        user_lastname: elements.lastNameInput.val().trim(),
        user_email: elements.emailSignupInput.val().trim(),
        password: elements.passwordInput.val(),
        contact: elements.phoneInput.val().trim(),
      };

      console.log("Sending signup request...");

      const response = await $.ajax({
        url: "/signup/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      console.log("Signup response:", response);

      if (response.status === "success" && response.require_otp) {
        showOtpModal();
      } else {
        throw new Error(response.message || "Unexpected response");
      }
    } catch (error) {
      console.error("Signup error:", error);
      showError(error.responseJSON?.message || "An error occurred during signup");
    } finally {
      elements.buttonText.removeClass("hidden");
      elements.buttonSpinner.addClass("hidden");
      elements.submitButton.prop("disabled", false);
    }
  });

  // OTP Form Submission
  elements.otpForm.on("submit", async function (e) {
    e.preventDefault();

    const otp = elements.otpInput.val().trim();
    if (!otp) {
      showOtpError("Please enter the OTP");
      return;
    }

    elements.otpVerifyButtonText.addClass("hidden");
    elements.otpVerifyButtonSpinner.removeClass("hidden");
    elements.otpVerifyButton.prop("disabled", true);

    try {
      const response = await $.ajax({
        url: "/verify-otp/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ otp }),
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      if (response.status === "success") {
        hideOtpModal();
        window.location.href = "/home/";
      } else {
        throw new Error(response.message || "Verification failed");
      }
    } catch (error) {
      showOtpError(error.responseJSON?.message || "Invalid OTP");
    } finally {
      elements.otpVerifyButtonText.removeClass("hidden");
      elements.otpVerifyButtonSpinner.addClass("hidden");
      elements.otpVerifyButton.prop("disabled", false);
    }
  });

  // Resend OTP Button Click
  elements.otpResendButton.on("click", async function () {
    try {
      const response = await $.ajax({
        url: "/resend-otp/",
        method: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      if (response.status === "success") {
        showOtpError("OTP resent successfully");
      }
    } catch (error) {
      showOtpError("Failed to resend OTP");
    }
  });

  // OTP Modal Close Button
  elements.otpCloseBtn.on("click", hideOtpModal);

  // Close OTP modal when clicking outside
  $(window).on("click", function (event) {
    if ($(event.target).is(elements.otpModal)) {
      hideOtpModal();
    }
  });

  elements.signInForm.on("submit", async function (e) {
    e.preventDefault();
    if (!validateLoginForm()) return;

    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    elements.loginButtonText.addClass("hidden");
    elements.loginButtonSpinner.removeClass("hidden");

    try {
      const response = await $.ajax({
        url: "/login/",
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        contentType: "application/json",
        data: JSON.stringify({
          email: elements.email_login.val(),
          password: elements.passwords.val(),
        }),
      });

      window.location.href = "/home/";
    } catch (error) {
      showError("Check your email and password", elements.loginError);
    } finally {
      elements.loginButtonText.removeClass("hidden");
      elements.loginButtonSpinner.addClass("hidden");
    }
  });
});
