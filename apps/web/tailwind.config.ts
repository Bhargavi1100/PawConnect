import type { Config } from "tailwindcss";

// Warm-neutral, pet-care palette: cream surfaces, sage green primary,
// soft blush pink accents, and a calm clay tone for urgency — professional
// healthcare feel, not a warning siren.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FBF9F5",
          100: "#F6F1E8",
          200: "#EDE4D3",
        },
        sage: {
          50: "#F1F5EF",
          100: "#E4EBDF",
          200: "#CBD9C2",
          600: "#66845C",
          700: "#54704B",
          800: "#455C3E",
        },
        blush: {
          100: "#F7E7E8",
          200: "#EFD0D3",
          500: "#D18C93",
        },
        clay: {
          50: "#F9F1EE",
          100: "#F2E1DA",
          200: "#E5C7BB",
          600: "#A85D4B",
          700: "#8F4E3F",
          800: "#754034",
        },
        tan: {
          100: "#F0E8DA",
          200: "#E2D3BC",
          600: "#8A7355",
        },
      },
    },
  },
  plugins: [],
};

export default config;
