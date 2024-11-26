let chartData = function () {
  function calculateCategoryTotal(category) {
    return category.reduce((sum, value) => sum + value, 0);
  }

  return {
    date: "overall",
    options: [{ label: "Overall Trend", value: "overall" }],
    selectedOption: 0,
    total: {
      alive: 0,
      dead: 0,
      scales: 0,
      illegal_trade: 0,
    },
    data: null,
    chart: null,

    selectOption: function (index) {
      this.selectedOption = index;
      this.date = this.options[index].value;

      // Destroy existing chart
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      // Check if we have the data, otherwise fetch
      if (this.data && this.data[this.date]) {
        this.updateTotals(); // Call updateTotals before rendering
        this.renderChart();
      } else {
        this.fetch();
      }
    },

    fetch: function () {
      const self = this;

      fetch(`/get-poaching-trends?period=${self.date}`)
        .then((response) => response.json())
        .then((data) => {
          // Initialize data structure
          self.data = {
            overall: {
              data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                alive: data.overall_trend.alive || [],
                dead: data.overall_trend.dead || [],
                scales: data.overall_trend.scales || [],
                illegal_trade: data.overall_trend.illegal_trade || [],
              },
            }
          };

          // Add yearly data
          Object.keys(data.yearly_reports).forEach(year => {
            self.data[year] = {
              data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                alive: data.yearly_reports[year].alive || [],
                dead: data.yearly_reports[year].dead || [],
                scales: data.yearly_reports[year].scales || [],
                illegal_trade: data.yearly_reports[year].illegal_trade || [],
              },
            };
          });

          // Update totals for the selected period
          self.updateTotals();

          // Render chart
          self.renderChart();
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    },

    updateTotals: function () {
      // Ensure data exists for the selected date
      if (!this.data || !this.data[this.date] || !this.data[this.date].data) {
        console.error("No data available for totals calculation:", this.date);
        return;
      }

      const selectedData = this.data[this.date].data;
      
      // Reset totals before calculating
      this.total = {
        alive: 0,
        dead: 0,
        scales: 0,
        illegal_trade: 0
      };

      // Calculate totals for the selected period
      this.total.alive = calculateCategoryTotal(selectedData.alive);
      this.total.dead = calculateCategoryTotal(selectedData.dead);
      this.total.scales = calculateCategoryTotal(selectedData.scales);
      this.total.illegal_trade = calculateCategoryTotal(selectedData.illegal_trade);
    },

    fetchAvailableYears: function () {
      this.options = [{ label: "Overall Trend", value: "overall" }];

      fetch('/get-available-years')
        .then((response) => response.json())
        .then((years) => {
          years.forEach(year => {
            this.options.push({ label: year.toString(), value: year });
          });
          this.selectedOption = 0;
          this.fetch();
        })
        .catch((error) => {
          console.error("Error fetching available years:", error);
        });
    },

    init: function () {
      this.fetchAvailableYears();
    },

    renderChart: function () {
      // Rest of the renderChart method remains the same as in the original code
      // ... (previous renderChart implementation)
    }
  };
};

// Initialize the chart
let dataChart = chartData();
dataChart.init();