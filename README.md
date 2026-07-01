# FX Checker - Currency Converter

A beautiful, modern currency converter app built with vanilla JavaScript, HTML, and CSS. Uses live exchange rates from the Frankfurter API.

## Features

- **Real-time Currency Conversion**: Enter an amount and see it convert instantly
- **Searchable Currency Picker**: Choose from 50+ currencies with flags
- **Swap Currencies**: Quick swap between send and receive currencies
- **Rate History**: View historical rates with interactive chart (1D, 1W, 1M, 3M, 1Y, 5Y)
- **Multi-currency Compare**: See your amount converted to multiple currencies at once
- **Favorites**: Pin your favorite currency pairs
- **Conversion Log**: Keep track of your past conversions
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Saves favorites and conversion history between sessions

## Technologies Used

- HTML5 (Semantic markup)
- CSS3 (Custom properties, Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Frankfurter API (https://frankfurter.dev/)
- JetBrains Mono font
- SVG icons

## Getting Started

### Prerequisites

- A modern web browser
- A local web server (like Python's `http.server`)

### Installation

1. Clone or download the repository
2. Open the project directory in your terminal
3. Start a local web server:

```bash
# Using Python 3
python -m http.server 8000
```

4. Open your browser and navigate to `http://localhost:8000`

## Usage

1. Enter an amount in the "Send" field
2. Select your send and receive currencies
3. See the converted amount update in real-time
4. Use the tabs to explore history, compare, favorites, and log

## Project Structure

```
main/
├── assets/
│   ├── fonts/
│   │   └── jetbrains-mono/
│   └── images/
│       ├── flags/
│       ├── favicon-32x32.png
│       ├── logo.svg
│       └── ...other icons
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Design

- Dark theme with indigo accents
- Clean, modern interface
- Smooth animations and transitions
- Fully responsive from mobile to desktop
- Accessible with keyboard navigation

## Known Limitations

- Historical data is limited to what the Frankfurter API provides
- Exchange rates are updated once per day
- Currency flags are available for most but not all currencies

## License

MIT
