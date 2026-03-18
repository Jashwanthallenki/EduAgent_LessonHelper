import React from "react";

function HighlightButton({ visible, onClick, position, textPreview }) {
  if (!visible) return null;

  const style = position
    ? {
        top: position.top,
        left: position.left
      }
    : {};

  return (
    <div className="highlight-button-popover" style={style}>
      <div className="highlight-preview">
        {textPreview ? `"${textPreview}"` : "No text selected"}
      </div>
      <button className="primary-btn" onClick={onClick}>
        Ask EduAgent
      </button>
    </div>
  );
}

export default HighlightButton;
