// MammalsVsReptilesRedirect.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MammalsVsReptilesRedirect = () => {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const room = params.get('room') || 'sala1';

        // Abrir en una nueva pestaña en lugar de redirigir
        window.open(`https://football-online-3d.dantecollazzi.com?room=${room}`, '_blank');
    }, [location]);

    return <div>Opening Mammals vs Reptiles game in a new tab...</div>;
};

export default MammalsVsReptilesRedirect;