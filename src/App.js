import React from 'react';
import NightSkyVisibilityChart from './NightSkyVisibilityChart';

function App() {
  return (
    <div className="App">
      <header className="bg-gray-800 text-white py-4">
        <h1 className="text-2xl font-bold text-center">Night Sky Visibility Chart</h1>
      </header>
      <main className="container mx-auto px-4 py-8">
        <NightSkyVisibilityChart />
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <p className="text-center text-sm">
          © {new Date().getFullYear()} Night Sky Visibility Chart. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;