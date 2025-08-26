import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import '../css/tools.css';
import boxRotationImage from '../images/box-rotation-thumbnail.webp';

const Tools = () => {
  const toolsList = [
    {
      id: 'learn-perspective',
      name: 'Interactive 3D Box Rotation Tool for Artists',
      description: 'A simple, browser-based tool designed to help artists practice and visualize 3D perspective. This tool simplifies the complex task of drawing a cube from any angle by restricting rotations to the key increments (0°, 22.5°, 45°, 67.5°, and 90°) commonly used in foundational drawing exercises. Use the directional buttons to cycle through horizontal (yaw) and vertical (pitch) angles. Toggle the "Solid View" checkbox to switch between an opaque cube for studying form and a transparent "x-ray" view for understanding the complete underlying structure. Perfect for daily warm-ups or for checking the accuracy of your own perspective drawings.',
      image: boxRotationImage
    }
  ];

  const ToolCard = ({ tool }) => (
    <Link to={`/tools/${tool.id}`} className="tool-card">
      <div className="tool-card-image-container">
        <img
          src={tool.image}
          alt={tool.name}
          className="tool-card-image"
        />
      </div>
      <div className="tool-card-content">
        <h3>{tool.name}</h3>
        <p>{tool.description}</p>
      </div>
    </Link>
  );

  return (
    <>
      <SEO
        title="Tools - Dante Collazzi | Development Tools"
        description="Development tools and utilities created by Dante Collazzi. Interactive demos and technical utilities for developers."
        name="Dante Collazzi"
        type="website"
      />
      <div className="tools-page">
        <h1>Development Tools</h1>
        <p>A collection of development tools and utilities for technical demonstrations.</p>
        <div className="tools-grid">
          {toolsList.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Tools;
