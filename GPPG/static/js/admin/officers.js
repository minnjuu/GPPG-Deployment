// Initialize on document load
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
  initializeYearFilter();
  initializeDropdowns();
});

function initializeSearch() {
  const searchInput = document.getElementById("officers-search");
  const cards = document.querySelectorAll('.grid > div[class*="bg-white"]');

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    cards.forEach((card) => {
      const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const position = card.querySelector("p")?.textContent.toLowerCase() || "";
      const dateJoined = card.querySelector(".text-gray-600")?.textContent.toLowerCase() || "";
      const socialLinks = card.querySelector(".text-gray-700")?.textContent.toLowerCase() || "";

      const matches = name.includes(searchTerm) || position.includes(searchTerm) || dateJoined.includes(searchTerm) || socialLinks.includes(searchTerm);

      card.style.display = matches ? "" : "none";
    });

    const visibleCards = [...cards].filter((card) => card.style.display !== "none");
    const emptyState = document.querySelector(".col-span-3");
    if (emptyState) {
      emptyState.style.display = visibleCards.length === 0 ? "" : "none";
    }
  });
}

function initializeYearFilter() {
  const yearFilter = document.getElementById("year-filter");
  if (yearFilter) {
    yearFilter.addEventListener("change", (e) => {
      const searchInput = document.getElementById("officers-search");
      const searchValue = searchInput ? searchInput.value : "";

      let url = new URL(window.location.href);
      let params = new URLSearchParams(url.search);

      if (e.target.value) {
        params.set("year", e.target.value);
      } else {
        params.delete("year");
      }

      if (searchValue) {
        params.set("search", searchValue);
      }

      params.delete("page");

      window.location.href = `${url.pathname}?${params.toString()}`;
    });
  }
}

function initializeDropdowns() {
  const dropdownButtons = document.querySelectorAll("[data-dropdown-toggle]");

  dropdownButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = button.getAttribute("data-dropdown-toggle");
      const dropdown = document.getElementById(targetId);

      document.querySelectorAll('[id^="dropdownDotsOfficer"]').forEach((d) => {
        if (d.id !== targetId) {
          d.classList.add("hidden");
        }
      });

      dropdown.classList.toggle("hidden");
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll('[id^="dropdownDotsOfficer"]').forEach((dropdown) => {
      if (!dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
      }
    });
  });
}

function showTitle(title) {
  const modalTitle = document.querySelector("#modal-title");
  if (modalTitle) {
    modalTitle.textContent = title;
  }
}
