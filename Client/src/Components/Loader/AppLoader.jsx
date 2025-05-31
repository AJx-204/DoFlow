import React, { useEffect, useState } from "react";

const AppLoader = ({ style }) => {
  const colors = [
    "#ff3c78", // Pinkish red
    "#3cfffa", // Cyan
    "#fffa3c", // Yellow
    "#ff5733", // Orange-red
    "#33ff57", // Bright green
    "#3357ff", // Bright blue
    "#8e44ad", // Purple
    "#e67e22", // Orange
    "#1abc9c", // Turquoise
    "#e74c3c", // Red
    "#f39c12", // Sunflower Yellow
    "#9b59b6", // Amethyst
    "#2ecc71", // Emerald Green
    "#3498db", // Peter River (blue)
    "#e84393", // Pink
    "#d35400", // Pumpkin Orange
    "#16a085", // Greenish teal
    "#2980b9", // Belize Hole (blue)
    "#c0392b", // Pomegranate (red)
    "#7f8c8d", // Grayish
  ];
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <span
        className={`${style} font-semibold`}
        style={{ color: colors[colorIndex], transition: "color 0.3s ease" }}
      >
        DoFlow
      </span>
      <span className="text-sm text-zinc-500 font-medium">.app</span>
    </div>
  );
};

export default AppLoader;
