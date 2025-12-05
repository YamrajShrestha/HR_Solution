// src/components/Common/StatCard.jsx
import React from "react";
import PropTypes from "prop-types";

const StatCard = ({ icon, label, value, color = "blue" }) => {
  const colorMap = {
    blue:  "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red:   "bg-red-100 text-red-600",
    yellow:"bg-yellow-100 text-yellow-600",
    purple:"bg-purple-100 text-purple-600",
    gray:  "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon:   PropTypes.node.isRequired,
  label:  PropTypes.string.isRequired,
  value:  PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color:  PropTypes.oneOf(["blue","green","red","yellow","purple","gray"]),
};

export default StatCard;