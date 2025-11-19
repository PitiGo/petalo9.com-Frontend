import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import '../css/tools.css';
import gameRegistry from './GameRegistry';

const Tools = () => {
  // Convertir el objeto de tools del registro a un array
  const toolsList = Object.keys(gameRegistry.tools).map(key => ({
    id: key,
    ...gameRegistry.tools[key]
  }));

  // Si quieres mantener la herramienta hardcodeada anterior (learn-perspective) si no está en el registro,
  // puedes agregarla manualmente o asegurarte de que esté en GameRegistry.js.
  // Por ahora, usaremos las del registro que es la fuente de verdad.

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
