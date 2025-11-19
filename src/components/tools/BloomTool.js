import React, { useState } from 'react';
import BloomImage from './BloomImage';
import placeholderImg from '../../images/logo.webp';

const BloomTool = () => {
    const [image, setImage] = useState(placeholderImg);
    const [params, setParams] = useState({
        strength: 1.5,
        radius: 0.4,
        threshold: 0.1,
        exposure: 1.0
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

    const presets = {
        default: { strength: 1.5, radius: 0.4, threshold: 0.1, exposure: 1.0 },
        cyberpunk: { strength: 2.5, radius: 0.8, threshold: 0.15, exposure: 1.2 },
        softDream: { strength: 1.0, radius: 1.0, threshold: 0, exposure: 0.9 },
        neonPop: { strength: 3.0, radius: 0.2, threshold: 0.6, exposure: 1.5 },
        subtle: { strength: 0.6, radius: 0.3, threshold: 0.3, exposure: 1.0 }
    };

    const applyPreset = (presetName) => {
        setParams(presets[presetName]);
    };

    const labelStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#ffffff',
        fontSize: '1.1rem'
    };

    const inputStyle = {
        width: '100%',
        cursor: 'pointer',
        accentColor: '#64ffda'
    };

    const buttonStyle = {
        background: 'transparent',
        border: '1px solid #64ffda',
        color: '#64ffda',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    return (
        <div className="bloom-tool-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div className="tool-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '10px' }}>Glow Effect Generator</h1>
                <p style={{ color: '#ccd6f6', fontSize: '1.2rem' }}>Upload any image and apply a cyberpunk bloom effect.</p>
            </div>

            <div className="tool-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>

                {/* Área del Canvas */}
                <div className="canvas-wrapper" style={{
                    height: '600px',
                    border: '1px solid #333',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#020c1b',
                    boxShadow: '0 10px 30px -10px rgba(2,12,27,0.7)'
                }}>
                    <BloomImage
                        imageUrl={image}
                        strength={params.strength}
                        radius={params.radius}
                        threshold={params.threshold}
                        exposure={params.exposure}
                    />
                </div>

                {/* Panel de Control */}
                <div className="controls-panel" style={{
                    background: '#112240',
                    padding: '30px',
                    borderRadius: '16px',
                    color: '#e6f1ff',
                    height: 'fit-content',
                    boxShadow: '0 10px 30px -15px rgba(2,12,27,0.7)'
                }}>
                    <div className="control-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#64ffda', fontSize: '1.2rem' }}>
                            Upload Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{
                                width: '100%',
                                color: '#ccd6f6',
                                padding: '10px',
                                background: '#0a192f',
                                borderRadius: '8px',
                                border: '1px solid #233554'
                            }}
                        />
                    </div>

                    {/* Presets */}
                    <div className="control-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>
                            Presets
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <button onClick={() => applyPreset('default')} style={buttonStyle}>Default</button>
                            <button onClick={() => applyPreset('cyberpunk')} style={buttonStyle}>Cyberpunk</button>
                            <button onClick={() => applyPreset('neonPop')} style={buttonStyle}>Neon Pop</button>
                            <button onClick={() => applyPreset('softDream')} style={buttonStyle}>Soft Dream</button>
                            <button onClick={() => applyPreset('subtle')} style={buttonStyle}>Subtle</button>
                        </div>
                    </div>

                    <div className="control-group" style={{ marginBottom: '25px' }}>
                        <label style={labelStyle}>
                            Exposure (Brightness) <span>{params.exposure}</span>
                        </label>
                        <input
                            type="range"
                            name="exposure"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={params.exposure}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div className="control-group" style={{ marginBottom: '25px' }}>
                        <label style={labelStyle}>
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
                            style={inputStyle}
                        />
                    </div>

                    <div className="control-group" style={{ marginBottom: '25px' }}>
                        <label style={labelStyle}>
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
                            style={inputStyle}
                        />
                    </div>

                    <div className="control-group" style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>
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
                            style={inputStyle}
                        />
                        <p style={{ fontSize: '0.9rem', color: '#a8b2d1', marginTop: '10px', lineHeight: '1.5' }}>
                            Controls which parts glow. Lower values make darker pixels glow. Higher values restrict glow to only the brightest pixels.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloomTool;
