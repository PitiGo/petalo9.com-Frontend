import React, { useState } from 'react';
import BloomImage from './BloomImage';
import placeholderImg from '../../images/logo.webp'; // Asegúrate de tener una imagen por defecto o usa null

const BloomTool = () => {
    const [image, setImage] = useState(placeholderImg);
    const [params, setParams] = useState({
        strength: 1.5,
        radius: 0.4,
        threshold: 0.1
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
        }
    };

    const handleChange = (e) => {
        setParams({
            ...params,
            [e.target.name]: parseFloat(e.target.value)
        });
    };

    return (
        <div className="bloom-tool-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div className="tool-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1>Glow Effect Generator</h1>
                <p style={{ color: '#ccd6f6' }}>Upload any image and apply a cyberpunk bloom effect.</p>
            </div>

            <div className="tool-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>

                {/* Área del Canvas */}
                <div className="canvas-wrapper" style={{
                    height: '500px',
                    border: '2px solid #64ffda',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 0 20px rgba(100, 255, 218, 0.1)'
                }}>
                    <BloomImage
                        imageUrl={image}
                        strength={params.strength}
                        radius={params.radius}
                        threshold={params.threshold}
                    />
                </div>

                {/* Panel de Control */}
                <div className="controls-panel" style={{
                    background: '#112240',
                    padding: '25px',
                    borderRadius: '12px',
                    color: '#e6f1ff'
                }}>
                    <div className="control-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#64ffda' }}>
                            Upload Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ width: '100%', color: '#ccd6f6' }}
                        />
                    </div>

                    <div className="control-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            Strength (Intensity) <span>{params.strength}</span>
                        </label>
                        <input
                            type="range"
                            name="strength"
                            min="0"
                            max="5"
                            step="0.1"
                            value={params.strength}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="control-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            Radius (Spread) <span>{params.radius}</span>
                        </label>
                        <input
                            type="range"
                            name="radius"
                            min="0"
                            max="2"
                            step="0.01"
                            value={params.radius}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="control-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            Threshold (Cutoff) <span>{params.threshold}</span>
                        </label>
                        <input
                            type="range"
                            name="threshold"
                            min="0"
                            max="1"
                            step="0.01"
                            value={params.threshold}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: '0.8em', color: '#8892b0', marginTop: '5px' }}>
                            Lower values make darker pixels glow. Higher values restrict glow to white pixels.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloomTool;
