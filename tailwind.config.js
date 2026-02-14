/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./*.html",
        "./*.js",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "var(--colors-primary)",
                "background-light": "#f5f7f8",
                "background-dark": "#101922",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
            },
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/container-queries"),
    ],
};
