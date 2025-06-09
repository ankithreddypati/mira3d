import React from "react";

const SplatCard = ({ splat, onEmbed }) => {
  return (
    <div className="splat-card">
      <div className="preview-box">
        <div className="preview-placeholder">.splat</div>
      </div>
      <div className="splat-name">{splat.name}</div>
      <button className="load-btn" onClick={() => onEmbed(splat.url)}>
        Embed
      </button>
    </div>
  );
};

export default SplatCard;
