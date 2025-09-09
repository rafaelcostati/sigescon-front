// BackgroundParticles.tsx
import React from "react";
import "./BackgroundParticles.css";

const BackgroundParticles: React.FC = () => {
  return (
    <div className="background">
      {[...Array(30)].map((_, i) => (
        <span key={i} className="particle" />
      ))}
    </div>
  );
};

export default BackgroundParticles;
