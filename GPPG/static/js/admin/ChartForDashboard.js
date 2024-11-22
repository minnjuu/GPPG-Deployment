// Line Chart Code for User Account Chart
const userAccountCtx = document.getElementById("UserAccountChart").getContext("2d");
let userAccountChart;

const yearSelect = document.getElementById("yearSelect");

// Fetch data from the server
async function fetchUserAccountData() {
  const response = await fetch('/get-registereduser-data/');
  const data = await response.json();
  return data;
}

// Populate the year select options
async function loadYearOptions() {
  const data = await fetchUserAccountData();
  Object.keys(data).forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
  return Object.keys(data)[0]; // Return the first year
}

// Update the chart with the selected year's data
async function updateChartUser() {
  const selectedYear = yearSelect.value;
  const data = await fetchUserAccountData();

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const userAccountGradient = userAccountCtx.createLinearGradient(0, 0, 0, 400);
  userAccountGradient.addColorStop(0, "rgba(255, 159, 64, 0.6)");
  userAccountGradient.addColorStop(1, "rgba(75, 192, 192, 0)");

  const userAccountChartConfig = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: selectedYear,
          data: data[selectedYear],
          fill: true,
          backgroundColor: userAccountGradient,
          borderColor: "rgba(255, 159, 64, 1)",
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: "rgba(255, 159, 64, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "black",
          },
          grid: {
            display: false,
          },
        },
        x: {
          ticks: {
            color: "black",
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };

  if (userAccountChart) {
    userAccountChart.destroy();
  }

  userAccountChart = new Chart(userAccountCtx, userAccountChartConfig);
}

async function initializeChartUser() {
  const firstYear = await loadYearOptions();
  yearSelect.value = firstYear;
  await updateChartUser();
}

initializeChartUser();

yearSelect.addEventListener("change", updateChartUser);


// Bar and Line Chart for Pangolin
const PoachingChart_ctx = document.getElementById("PangolinChart").getContext("2d");

// Function to get responsive bar thickness
function getBarThickness() {
    return window.innerWidth <= 600 ? 20 : 50;
}

// Global chart instance
let barChart = null;

// Initial data and labels
let initialData = [];
let initialLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Function to initialize or update the chart
function initializeChart(chartData, labels) {
    if (!barChart) {
        // Create new chart with both bar and line datasets
        barChart = new Chart(PoachingChart_ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                  {
                    type: "bar",
                    data: initialData,
                    backgroundColor: "#C1A682",
                    borderColor: "#C1A682",
                    borderWidth: 1,
                    barThickness: getBarThickness(),
                    borderRadius: 10,
                    order: 2,
                  },
                  {
                    type: "line",
                    data: initialData,
                    borderColor: "#C1A682",
                    borderWidth: 2,
                    pointBackgroundColor: "#C1A682",
                    pointBorderColor: "#C1A682",
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    fill: false,
                    tension: 0.3,
                    order: 1,
                  },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 20
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "black",
                            precision: 0
                        },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: "black" },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                },
                animation: {
                    duration: 1000,
                    easing: "easeInOutQuart",
                }
            }
        });
    } else {
        // Update existing chart
        barChart.data.labels = labels;
        barChart.data.datasets[0].data = chartData; // Bar data
        barChart.data.datasets[1].data = chartData; // Line data
        barChart.update();
    }

    // Calculate and display total
    const totalSum = chartData.reduce((acc, curr) => acc + curr, 0);
    document.getElementById("totalDisplay").innerText = `Total: ${totalSum}`;
}

// Function to fetch and process chart data from API
async function fetchChartData() {
    try {
        const response = await fetch('/get-chart-data/');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Aggregate incidents for each month across all statuses
        const monthlyTotals = initialLabels.map((_, monthIndex) => 
            Object.values(data).reduce((total, trendData) => 
                total + trendData.overall[monthIndex], 0)
        );

        initialData = monthlyTotals;  // Store initial data for future reset
        return monthlyTotals;
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return new Array(12).fill(0);  // Return zeroed data in case of an error
    }
}

// Function to update chart with date filtering
async function updateChart() {
    const startDateInput = document.getElementById("startDateInput").value;
    const endDateInput = document.getElementById("endDateInput").value;
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (startDateInput && endDateInput && startDate <= endDate) {
        const startMonthIndex = startDate.getMonth();
        const endMonthIndex = endDate.getMonth();

        const filteredData = initialData.slice(startMonthIndex, endMonthIndex + 1);
        const filteredLabels = initialLabels.slice(startMonthIndex, endMonthIndex + 1);

        initializeChart(filteredData, filteredLabels);
    } else {
        document.getElementById("totalDisplay").innerText = "Invalid Date Range";
    }
}

// Function to clear dates and reset chart
function clearDates() {
    document.getElementById("startDateInput").value = "";
    document.getElementById("endDateInput").value = "";

    initializeChart(initialData, initialLabels);
}

// Initialize chart on page load
window.addEventListener('load', async function () {
    const chartData = await fetchChartData();
    initializeChart(chartData, initialLabels);
});

// Responsive chart resizing
window.addEventListener('resize', function() {
    if (barChart) {
        barChart.data.datasets[0].barThickness = getBarThickness();
        barChart.update();
    }
});



