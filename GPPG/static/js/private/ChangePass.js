$(document).ready(function () {
  const loadingStates = {
    toggle: function (isLoading) {
      const $submitBtn = $('#changePasswordForm button[type="submit"]');
      const $normalState = $(".normal-state");
      const $loadingState = $(".loading-state");

      $submitBtn.prop("disabled", isLoading);
      $normalState.toggleClass("hidden", isLoading);
      $loadingState.toggleClass("hidden", !isLoading);
    },
  };

  const clearErrors = () => {
    $(".text-red-500").addClass("hidden");
  };

  const showErrors = (errors) => {
    Object.entries(errors).forEach(([field, error]) => {
      const $errorEl = $(`#${field}_error`);
      if ($errorEl.length) {
        $errorEl.text(error).removeClass("hidden");
      }
    });
  };

  $("#changePasswordForm").on("submit", async function (e) {
    e.preventDefault();
    clearErrors();
    loadingStates.toggle(true);

    const formData = {
      current_password: $("#current_password").val(),
      new_password: $("#new_password").val(),
      confirm_password: $("#confirm_password").val(),
    };

    try {
      const response = await $.ajax({
        url: "/change_password/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val(),
        },
        data: JSON.stringify(formData),
      });

      if (response.status === "error") {
        showErrors(response.errors);
      } else if (response.status === "success") {
        closeChangePasswordModal();
      }
    } catch (error) {
      console.error("Error:", error);
      showErrors({ __all__: "An unexpected error occurred. Please try again." });
    } finally {
      loadingStates.toggle(false);
    }
  });
});

function openChangePasswordModal() {
  $("#changePasswordModal").removeClass("hidden");
  $("body").css("overflow", "hidden");
}

function closeChangePasswordModal() {
  $("#changePasswordModal").addClass("hidden");
  $("body").css("overflow", "");
  $("#changePasswordForm")[0].reset();
  $(".text-red-500").addClass("hidden");
}

function togglePassword(fieldName) {
  const $input = $(`#${fieldName}`);
  const $icon = $(`#${fieldName}_icon`);

  if ($input.attr("type") === "password") {
    $input.attr("type", "text");
    $icon.removeClass("mdi-eye-off").addClass("mdi-eye");
  } else {
    $input.attr("type", "password");
    $icon.removeClass("mdi-eye").addClass("mdi-eye-off");
  }
}
