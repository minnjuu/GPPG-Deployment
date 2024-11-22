const ctx = document.getElementById("UserAccountChart").getContext("2d");

// Sample data with years as keys
const dataByYear = {
  2023: [65, 59, 80, 81, 56, 55, 40, 45, 60, 75, 82, 90],
  2022: [28, 48, 40, 19, 86, 27, 90, 55, 70, 85, 89, 95],
  2021: [40, 65, 75, 80, 60, 50, 35, 55, 72, 80, 85, 92],
};

// Labels for the chart (months)
const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Populate dropdown dynamically based on the years in the data
const yearSelect = document.getElementById("yearSelect");
Object.keys(dataByYear).forEach((year) => {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearSelect.appendChild(option);
});

// Set initial year to the first available year
let selectedYear = Object.keys(dataByYear)[0];

// Create Gradient for Line Chart
let gradient = Pangolinctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, "rgba(75, 192, 192, 0.5)");
gradient.addColorStop(1, "rgba(75, 192, 192, 0)");

// Chart Configuration
const chartConfig = {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: selectedYear,
        data: dataByYear[selectedYear],
        fill: true,
        backgroundColor: gradient,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

// Initialize Chart
let myLineChart = new Chart(Pangolinctx, chartConfig);

// Event Listener for Dropdown Change
yearSelect.addEventListener("change", function () {
  selectedYear = this.value;
  myLineChart.data.datasets[0].data = dataByYear[selectedYear];
  myLineChart.data.datasets[0].label = selectedYear;
  myLineChart.update();
});
