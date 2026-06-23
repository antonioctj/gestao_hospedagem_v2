/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6600',
        secondary: '#1a1a1a',
        accent: '#2196F3',
        success: '#4CAF50',
        danger: '#f44336',
        warning: '#ff9800',
      },
    },
  },
  plugins: [],
}
