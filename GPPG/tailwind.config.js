/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html", "./static/**/*.js", "./static/**/*.css", "node_modules/preline/dist/*.js", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 3s linear infinite",
        slideIn: "slideIn 0.5s ease-out forwards",
        cardEntry: "cardEntry 0.8s ease-out forwards",
        gradient: "gradient 15s ease infinite",
        fadeInUp: "fadeInUp 0.5s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        cardEntry: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      plugins: [
        function ({ addUtilities, theme }) {
          const delays = {};
          for (let i = 1; i <= 10; i++) {
            delays[`.stat-card-delay-${i}`] = {
              "animation-delay": `${i * 0.1}s`,
            };
          }
          addUtilities(delays);
        },
        function ({ addUtilities, theme }) {
          addUtilities({
            ".filter-active": {
              "background-color": "rgb(20 83 45)",
              color: "white",
              "border-color": "rgb(20 83 45)",
              transform: "scale(1.05)",
            },
          });
        },
      ],

      colors: {
        greenbutton: "#014737",
        blueshade: "#3498db",
        greenshade: "#2ecc71",
        backgroundshade: "#ecf0f1",
        accentshade: "##e74c3c",
        yellowshade: "##f1c40f",
        warmBeige: "#F4F0E6",
        mutedCocoa: "#A67B5B",
        ivory: "#FFFFF0",
        softGold: "#D1B794",
        softGoldHover: "#C1A682",
        pastelOrange: "#E8B97E",
        subduedGreen: "#A4B89F",
        darkTaupe: "#4B4843",
        deepGreen: "#8E9E8D",
        offWhite: "#F9F6EF",
        lightGray: "#E2E0DD",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
    },
    fontFamily: {
      body: [
        "Roboto",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "system-ui",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
      sans: [
        "Roboto",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "system-ui",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
    },
  },
  plugins: [
    require("preline/plugin"),
    require("flowbite/plugin")({
      datatables: true,
    }),
  ],
};
