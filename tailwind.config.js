/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0D12",
        panel: "#13131B",
        surface: "#191923",
        raised: "#20202C",
        violet: "#7656E8",
        lilac: "#A78BFA",
      },
      fontFamily: { sans: ["var(--font-geist)", "Inter", "sans-serif"] },
    },
  },
  plugins: [],
};
