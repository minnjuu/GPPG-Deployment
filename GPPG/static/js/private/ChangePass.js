document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#adduser form");
  const loadingStates = {
    toggle: function (isLoading) {
      const normalState = form.querySelector(".normal-state");
      const loadingState = form.querySelector(".loading-state");
      const submitBtn = form.querySelector('button[type="submit"]');

      submitBtn.disabled = isLoading;
      normalState.classList.toggle("hidden", isLoading);
      loadingState.classList.toggle("hidden", !isLoading);
    },
  };

  form.addEventListener("htmx:beforeRequest", function () {
    loadingStates.toggle(true);
    document.querySelectorAll(".text-red-500").forEach((el) => el.classList.add("hidden"));
  });

  form.addEventListener("htmx:afterRequest", function (event) {
    loadingStates.toggle(false);

    const response = JSON.parse(event.detail.xhr.response);
    if (response.status === "error") {
      if (response.errors) {
        Object.entries(response.errors).forEach(([field, errors]) => {
          const errorEl = document.getElementById(`${field}_error`);
          if (errorEl) {
            errorEl.textContent = errors[0];
            errorEl.classList.remove("hidden");
          }
        });
      }
    } else if (response.status === "success") {
      setTimeout(closeChangePasswordModal, 2000);
      form.reset();
    }
  });
});

function togglePassword(fieldName) {
  const input = document.querySelector(`input[name="${fieldName}"]`);
  const icon = document.getElementById(`${fieldName}_icon`);

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("mdi-eye-off");
    icon.classList.add("mdi-eye");
  } else {
    input.type = "password";
    icon.classList.remove("mdi-eye");
    icon.classList.add("mdi-eye-off");
  }
}
