import React from "react";

const Event = ({ event }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-2">{event.date}</p>
      <p className="text-gray-800 mb-4">{event.description}</p>
      <button className="bg-blue-600 text-white py-2 px-4 rounded-lg">
        Interested
      </button>
    </div>
  );
};

export default Event;
