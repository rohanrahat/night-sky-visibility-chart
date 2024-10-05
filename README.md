# Night Sky Visibility Chart

## Overview

The Night Sky Visibility Chart is an interactive web application that allows astronomers and stargazers to visualize the visibility of celestial objects from a specific location on Earth. This tool is particularly useful for planning observations and understanding when certain objects will be visible in the night sky.

You can try the live application here: [Night Sky Visibility Chart](https://rohanrahat.github.io/night-sky-visibility-chart/)

## Features

- Input custom observatory locations using latitude and longitude
- Select specific dates for observation planning
- Enter celestial object coordinates (Right Ascension and Declination)
- Generate visibility charts showing object altitude over a 24-hour period
- Display sun altitude to indicate daylight hours
- Responsive design for use on various devices

## How to Use

1. **Observatory Location**: Enter the latitude and longitude of your observation point. Use negative values for South latitude and West longitude. (e.g., "-30.169, -70.806" for Cerro Tololo Observatory)

2. **Observation Date**: Select the date for which you want to generate the visibility chart.

3. **Target Object**: Enter the Right Ascension (RA) and Declination (Dec) of the celestial object you want to observe. Use the format "RA, Dec" in degrees. (e.g., "64.05, -55.78" for NGC 1553)

4. Click the "Generate Chart" button to create the visibility chart.

5. The resulting chart will show:
   - The altitude of your target object over 24 hours (purple line)
   - The altitude of the Sun over 24 hours (orange line)
   - A reference line at 0° representing the horizon

## Technical Details

This application is built using:
- React.js for the user interface
- Recharts for chart rendering
- SunCalc for astronomical calculations

The application performs the following calculations:
- Converts input coordinates to the appropriate format
- Calculates Local Sidereal Time (LST)
- Determines object altitude based on celestial coordinates and observer location
- Computes Sun position and altitude

## Local Development

To set up this project locally:

1. Clone the repository:
   ```
   git clone https://github.com/rohanrahat/night-sky-visibility-chart.git
   ```

2. Navigate to the project directory:
   ```
   cd night-sky-visibility-chart
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Contributing

Contributions to improve the Night Sky Visibility Chart are welcome. Please feel free to submit issues or pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

For any queries or suggestions, please open an issue on this GitHub repository.

---

Happy stargazing!