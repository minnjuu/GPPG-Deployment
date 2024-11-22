$(document).ready(function () {
  let highlight;
  let selectedFeature = null;
  let dataLoaded = false;
  let mapRendered = false;
  let Datamap = {};
  let maxIncidents = 0;
  let chartInstance;

  const map = new ol.Map({
    target: "map",
    layers: [],
    view: new ol.View({
      center: ol.proj.fromLonLat([118.7384, 9.8349]),
      zoom: 7.5,
      minZoom: 7,
      maxZoom: 18,
    }),
  });

  function checkLoadingComplete() {
    if (dataLoaded && mapRendered) {
      hideLoading();
    }
  }

  function showLoading() {
    $("#loading-animation")
      .removeClass("hidden")
      .html('<div class="flex items-center absolute mt-10 inset-1 justify-center"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>');
  }

  function hideLoading() {
    $("#loading-animation").addClass("hidden").empty();
    $("#map").removeClass("hidden");
  }

  showLoading();

  const $overlayElement = $("<div>");
  const overlay = new ol.Overlay({
    element: $overlayElement[0],
    positioning: "bottom-center",
    stopEvent: true,
    offset: [0, -10],
  });
  map.addOverlay(overlay);

  const highlightStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "#ff0000",
      width: 0.5,
    }),
    fill: new ol.style.Fill({
      color: "rgba(255, 0, 0, 0.1)",
    }),
  });

  const featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: highlightStyle,
  });

  async function fetchRegionData() {
    try {
      const response = await $.ajax({
        url: "/get-region-data/",
        method: "GET",
        dataType: "json",
      });

      Datamap = response;
      maxIncidents = Math.max(...Object.values(Datamap).map((region) => region.dead + region.alive + region.scales + region.illegalTrades));
    } catch (error) {
      console.error("Error fetching data:", error);
      Datamap = {};
    } finally {
      dataLoaded = true;
      checkLoadingComplete();
    }
  }

  function initializeMapFeatures() {
    if (Object.keys(Datamap).length === 0) {
      console.warn("No data available in Datamap. Map initialization halted.");
      return;
    }

    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: "/static/maps/ClusterOfPalawan_filtereds.geojson",
        format: new ol.format.GeoJSON(),
      }),
      style: function (feature) {
        const clusterName = feature.get("Cluster");
        const regionData = Datamap[clusterName];

        if (!regionData) {
          return new ol.style.Style({
            stroke: new ol.style.Stroke({ color: "#4b3621", width: 0.5 }),
            fill: new ol.style.Fill({ color: "rgba(200, 200, 200, 0.3)" }),
          });
        }

        const totalIncidents = regionData.dead + regionData.alive + regionData.scales + regionData.illegalTrades;
        const normalizedIntensity = Math.min(totalIncidents / maxIncidents, 1);
        const greenShade = 255 - Math.round(144 * normalizedIntensity);
        const fillColor = `rgba(0, ${greenShade}, 0, 0.3)`;

        return new ol.style.Style({
          stroke: new ol.style.Stroke({ color: "#4b3621", width: 0.5 }),
          fill: new ol.style.Fill({ color: fillColor }),
        });
      },
    });

    vectorLayer.getSource().on("featuresloadend", function () {
      dataLoaded = true;
      checkLoadingComplete();
    });

    vectorLayer.getSource().on("featuresloaderror", function (error) {
      console.error("Error loading features:", error);
      $("#loading-animation").html('<div class="text-red-500">Error loading map data</div>');
      dataLoaded = true;
      checkLoadingComplete();
    });

    map.addLayer(vectorLayer);

    map.on("rendercomplete", function () {
      mapRendered = true;
      checkLoadingComplete();
    });

    map.on("pointermove", function (evt) {
      if (selectedFeature) return;

      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);

      if (feature !== highlight) {
        if (highlight) {
          featureOverlay.getSource().removeFeature(highlight);
        }
        if (feature) {
          featureOverlay.getSource().addFeature(feature);
          const regionName = feature.get("Cluster") || "Unknown Region";
          updateOverlay(regionName, evt.coordinate);
        } else {
          overlay.setPosition(undefined);
        }
        highlight = feature;
      }
    });

    map.on("click", function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);

      if (feature) {
        selectedFeature = feature;
        featureOverlay.getSource().clear();
        featureOverlay.getSource().addFeature(feature);
        const regionName = feature.get("Cluster") || "Unknown Region";
        updateOverlay(regionName, evt.coordinate);
      } else {
        removeOverlay();
      }
    });
  }

  function updateOverlay(regionName, coordinate) {
    const data = Datamap[regionName];
    const totalIncidentsPalawan = calculateTotalIncidents(Datamap);
    const regionTotal = data ? data.dead + data.alive + data.scales + data.illegalTrades : 0;
    const regionPercentage = totalIncidentsPalawan ? ((regionTotal / totalIncidentsPalawan) * 100).toFixed(2) : 0;

    $overlayElement.html(`
      <div class="bg-white p-5 rounded-2xl relative shadow-lg">
        <button class="remove-overlay absolute top-2 right-2 m-1 text-sm">&times;</button>
        <div class="info-container mb-5 text-center">
          <p class="font-bold text-lg">${regionName}</p>
          <div class="text-sm mt-2">
            <p class="font-semibold">Poaching Incidents Recorded:</p>
            <p class="text-2xl font-bold text-orange-600">${regionTotal}</p>
          </div>
          <p class="text-gray-600 mt-1"><b>${regionPercentage}%</b> of total incidents</p>
        </div>
        <div class="chart-container mt-5">
          <canvas id="donutChart" width="220" height="220"></canvas>
        </div>
      </div>
    `);

    overlay.setPosition(coordinate);

    if (data) {
      drawDonutChart(data);
    } else {
      $(".chart-container").html('<p class="text-center text-gray-600">No data available</p>');
    }

    $(".remove-overlay").on("click", removeOverlay);
  }

  function drawDonutChart(data) {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = $("#donutChart")[0].getContext("2d");
    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Dead", "Alive", "Scales", "Illegal Trades"],
        datasets: [
          {
            data: [data.dead, data.alive, data.scales, data.illegalTrades],
            backgroundColor: ["#ffa500", "#008000", "#8b4513", "#a52a2a"],
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 10,
              usePointStyle: true,
              color: "#000",
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = data.dead + data.alive + data.scales + data.illegalTrades;
                const value = context.raw;
                const percentage = ((value / total) * 100).toFixed(2);
                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
              },
            },
          },
          datalabels: {
            color: "white",
            formatter: (value) => `${value}`,
            font: { weight: "semibold" },
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  }

  function calculateTotalIncidents(dataMap) {
    return Object.values(dataMap).reduce((total, region) => total + region.dead + region.alive + region.scales + region.illegalTrades, 0);
  }

  function removeOverlay() {
    overlay.setPosition(undefined);
    featureOverlay.getSource().clear();
    highlight = null;
    selectedFeature = null;
  }

  fetchRegionData().then(initializeMapFeatures);
});
