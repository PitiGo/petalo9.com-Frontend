import React, { Suspense, lazy } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import '../css/tools.css';
import gameRegistry from './GameRegistry';

const ToolPlayer = () => {
  const { toolId } = useParams();

  const toolInfo = gameRegistry.tools[toolId];

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
