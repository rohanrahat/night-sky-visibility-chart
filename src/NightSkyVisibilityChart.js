import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SunCalc from 'suncalc';

const calculateObjectVisibility = (date, latitude, longitude, targetRA, targetDec) => {
  const result = [];
  const localDate = new Date(date);

  for (let hour = 0; hour < 24; hour++) {
    localDate.setHours(hour);
    
    // Calculate local sidereal time (LST)
    const jd = SunCalc.getJulianCentury(localDate) * 36525 + 2451545.0;
    const lst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + longitude) % 360;

    // Calculate hour angle
    const hourAngle = (lst - targetRA + 360) % 360;

    // Calculate altitude
    const sinAlt = Math.sin(targetDec * Math.PI / 180) * Math.sin(latitude * Math.PI / 180) +
                   Math.cos(targetDec * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
                   Math.cos(hourAngle * Math.PI / 180);
    const altitude = Math.asin(sinAlt) * 180 / Math.PI;

    // Calculate sun position
    const sunPosition = SunCalc.getPosition(localDate, latitude, longitude);
    const sunAltitude = sunPosition.altitude * 180 / Math.PI;

    result.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      altitude: altitude,
      sunAltitude: sunAltitude
    });
  }

  return result;
};

const NightSkyVisibilityChart = () => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [target, setTarget] = useState('');
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState('');

  const generateChartData = useCallback(() => {
    setError('');
    try {
      const [lat, lon] = location.split(',').map(num => parseFloat(num.trim()));
      const [ra, dec] = target.split(',').map(num => parseFloat(num.trim()));

      if (isNaN(lat) || isNaN(lon) || isNaN(ra) || isNaN(dec)) {
        throw new Error('Invalid input format');
      }

      const data = calculateObjectVisibility(new Date(date), lat, lon, ra, dec);
      setChartData(data);
    } catch (err) {
      setError('Error generating chart. Please check your inputs.');
      console.error(err);
    }
  }, [location, date, target]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Observatory Location (lat, lon)</label>
          <input
            type="text"
            placeholder="e.g. 40.7128, -74.0060"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Observation Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Target Object (RA, Dec)</label>
          <input
            type="text"
            placeholder="e.g. 5.57, 22.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>
        <button
          onClick={generateChartData}
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Generate Chart
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {chartData.length > 0 && (
        <div className="mt-8 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" />
              <YAxis domain={[-90, 90]} />
              <Tooltip />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="altitude" stroke="#8884d8" name="Object Altitude" />
              <Line type="monotone" dataKey="sunAltitude" stroke="#ffa500" name="Sun Altitude" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default NightSkyVisibilityChart;