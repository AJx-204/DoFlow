import React from 'react';

const Loader = ({ size = '40px', color = '#3b82f6' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="animate-spin rounded-full border-t-2 border-b-2"
        style={{
          width: size,
          height: size,
          borderColor: `${color} transparent ${color} transparent`,
        }}
      ></div>
    </div>
  );
};

export default Loader;
