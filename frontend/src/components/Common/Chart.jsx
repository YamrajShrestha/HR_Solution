// src/components/Common/Chart.jsx
import React from "react";

const Chart = ({ data }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
    {/* replace with real chart later */}
  </div>
);

export default Chart;