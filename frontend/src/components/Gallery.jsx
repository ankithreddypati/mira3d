import React, { useEffect, useState } from "react";
import SplatCard from "./SplatCard";

const Gallery = ({ onEmbed }) => {
  const [splats, setSplats] = useState([]);

  useEffect(() => {
    const fileNames = ["shiva.splat", "keyboard.splat"];
    const splatData = fileNames.map((name) => ({
      name,
      url: `/splats/${name}`,
    }));
    setSplats(splatData);
  }, []);

  return (
    <div className="gallery-container">
      <h2>Splat Gallery</h2>
      <div className="gallery-grid">
        {splats.map((splat, index) => (
          <SplatCard key={index} splat={splat} onEmbed={onEmbed} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
