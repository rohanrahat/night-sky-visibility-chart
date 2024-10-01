import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Label, ReferenceArea } from 'recharts';
import SunCalc from 'suncalc';

const calculateObjectVisibility = (date, latitude, longitude, targetRA, targetDec) => {
  const result = [];
  const startDate = new Date(date);
  startDate.setHours(12, 0, 0, 0); // Start from noon of the previous day
  startDate.setDate(startDate.getDate() - 1);

  for (let hour = 0; hour < 24; hour++) {
    const currentDate = new Date(startDate.getTime() + hour * 60 * 60 * 1000);
    
    // Calculate local sidereal time (LST)
    const jd = currentDate / 86400000 + 2440587.5;
    const lst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + longitude) % 360;

    // Calculate hour angle
    const hourAngle = (lst - targetRA + 360) % 360;

    // Calculate altitude
    const sinAlt = Math.sin(targetDec * Math.PI / 180) * Math.sin(latitude * Math.PI / 180) +
                   Math.cos(targetDec * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
                   Math.cos(hourAngle * Math.PI / 180);
    const altitude = Math.asin(sinAlt) * 180 / Math.PI;

    // Calculate sun position
    const sunPosition = SunCalc.getPosition(currentDate, latitude, longitude);
    const sunAltitude = sunPosition.altitude * 180 / Math.PI;

    // Calculate moon position
    const moonPosition = SunCalc.getMoonPosition(currentDate, latitude, longitude);
    const moonAltitude = moonPosition.altitude * 180 / Math.PI;

    // Calculate moon phase
    const moonIllumination = SunCalc.getMoonIllumination(currentDate);

    // Calculate airmass (approximation)
    let airmass = altitude > 0 ? 1 / Math.sin(altitude * Math.PI / 180) : null;
    
    if (airmass && (airmass < 1 || airmass > 2)) {
      airmass = null; // Set to null if it's outside the range
    }

    result.push({
      time: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      altitude: altitude,
      moonAltitude: moonAltitude,
      airmass: airmass,
      isNight: sunAltitude < -18, // Astronomical night
      isTwilight: sunAltitude >= -18 && sunAltitude < 0,
      moonPhase: moonIllumination.phase,
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
  const [objectName, setObjectName] = useState('');

  const generateChartData = useCallback(() => {
    setError('');
    try {
      const [lat, lon] = location.split(',').map(num => parseFloat(num.trim()));
      const [ra, dec] = target.split(',').map(num => parseFloat(num.trim()));

      if (isNaN(lat) || isNaN(lon) || isNaN(ra) || isNaN(dec)) {
        throw new Error('Invalid input format');
      }

      if (!date) {
        throw new Error('Please select a date');
      }

      const data = calculateObjectVisibility(new Date(date), lat, lon, ra, dec);
      console.log('Generated data:', data);
      setChartData(data);
    } catch (err) {
      setError('Error generating chart: ' + err.message);
      console.error('Chart generation error:', err);
    }
  }, [location, date, target]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Input Parameters</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Object Name (optional)</label>
            <input
              type="text"
              placeholder="e.g. NGC 1553"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
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
      </div>
      <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="time"
              tickFormatter={(time) => time.split(':')[0]}
            >
              <Label value="Time (hours)" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis yAxisId="left" domain={[-90, 90]}>
              <Label value="Altitude (degrees)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <YAxis yAxisId="right" orientation="right" domain={[1, 2]} reversed>
              <Label value="Airmass" angle={90} position="insideRight" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" yAxisId="left" />
            {chartData.map((entry, index) => (
              entry.isNight && <ReferenceArea key={`night-${index}`} x1={entry.time} x2={chartData[index + 1]?.time} y1={-90} y2={90} fill="#001529" fillOpacity={0.3} yAxisId="left" />
            ))}
            {chartData.map((entry, index) => (
              entry.isTwilight && <ReferenceArea key={`twilight-${index}`} x1={entry.time} x2={chartData[index + 1]?.time} y1={-90} y2={90} fill="#7eb6ff" fillOpacity={0.3} yAxisId="left" />
            ))}
            <Line yAxisId="left" type="monotone" dataKey="altitude" stroke="#8884d8" name={`${objectName || "Object"} Altitude`} unit="°" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="moonAltitude" stroke="#ffd700" name="Moon Altitude" unit="°" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="airmass" stroke="#82ca9d" name="Airmass" dot={false} strokeOpacity={0}/>
          </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 p-2 shadow-md rounded">
        <p className="font-bold">{`Time: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index}>
            {`${entry.name}: ${entry.value !== undefined ? entry.value.toFixed(2) : 'N/A'}${entry.unit || ''}`}
          </p>
        ))}
        {payload[0] && payload[0].payload && (
          <p>{`Moon Phase: ${(payload[0].payload.moonPhase * 100).toFixed(0)}%`}</p>
        )}
      </div>
    );
  }
  return null;
};
export default NightSkyVisibilityChart;