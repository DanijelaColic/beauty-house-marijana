/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        // Earthy paleta
        primary: "#7B5E3B",
        gold: "#C6A15B",
        background: "#FAF7F2",
        surface: "#F2ECE4",
        textPrimary: "#2B2119",
        textSecondary: "#5B4B3F",
        border: "#E8DFD3",

        // 🔸 NOVE imenovane boje (za header/CTA/hero)
        headerTaupe: "#A89E92",
        ctaDark: "#4B4B4B",
        heroHeading: "#6E6A65",
      },
      boxShadow: { soft: "0 8px 24px rgba(43, 33, 25, 0.08)" },
      borderRadius: { "2xl": "1rem" },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Ubuntu",
          "Cantarell",
          "Noto Sans",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        auroraEarth: {
          primary: "#7B5E3B",
          secondary: "#C6A15B",
          accent: "#A67C52",
          neutral: "#2B2119",
          "base-100": "#FAF7F2",
          info: "#C6A15B",
          success: "#7BAE7F",
          warning: "#C4975C",
          error: "#B65C4D",
        },
      },
    ],
    darkTheme: "auroraEarth",
  },
};
