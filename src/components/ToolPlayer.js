import React, { Suspense, lazy } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import '../css/tools.css';

const ToolPlayer = () => {
  const { toolId } = useParams();

  // Registry de herramientas
  const toolsRegistry = {
    'learn-perspective': {
      path: () => import('./tools/LearnPerspective'),
      name: 'Interactive 3D Box Rotation Tool for Artists',
      description: 'A simple, browser-based tool designed to help artists practice and visualize 3D perspective.'
    }
  };

  const toolInfo = toolsRegistry[toolId];

  // Redireccionar si la herramienta no existe
  if (!toolInfo) {
    return <Navigate to="/tools" replace />;
  }

  // Cargar el componente de la herramienta de forma dinámica
  const ToolComponent = lazy(toolInfo.path);

  return (
    <div className="tool-player">
      <Suspense fallback={<div className="loading">Loading tool...</div>}>
        <ToolComponent />
      </Suspense>
    </div>
  );
};

export default ToolPlayer;
