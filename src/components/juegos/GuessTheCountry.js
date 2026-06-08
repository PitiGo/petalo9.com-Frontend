import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import './GuessTheCountry.css';

const GAME_MODES = {
    populous: {
        title: 'Guess the 15 Most Populous Countries',
        label: 'Most Populous',
        targetDescription: "the world's 15 most populous countries",
        successMessage: (countryName) => `${countryName} is one of the top 15 most populous countries.`,
        missMessage: (countryName) => `${countryName} is not in the top 15. Keep trying!`,
        countries: [
            "India", "China", "United States of America", "Indonesia", "Pakistan",
            "Nigeria", "Brazil", "Bangladesh", "Russia", "Mexico",
            "Japan", "Ethiopia", "Philippines", "Egypt", "Vietnam"
        ]
    },
    spanish: {
        title: 'Guess Every Spanish-Speaking Country',
        label: 'Spanish-speaking',
        targetDescription: 'all countries where Spanish is an official language',
        successMessage: (countryName) => `${countryName} is a Spanish-speaking country.`,
        missMessage: (countryName) => `${countryName} is not in this Spanish-speaking countries list.`,
        countries: [
            "Spain", "Mexico", "Guatemala", "Honduras", "El Salvador",
            "Nicaragua", "Costa Rica", "Panama", "Cuba", "Dominican Rep.",
            "Colombia", "Venezuela", "Ecuador", "Peru", "Bolivia",
            "Chile", "Argentina", "Paraguay", "Uruguay", "Eq. Guinea"
        ]
    },
    english: {
        title: 'Guess Every English-Speaking Country',
        label: 'Native English-speaking',
        targetDescription: 'countries where English is the predominant native language and that are available on this map',
        successMessage: (countryName) => `${countryName} is in the native English-speaking countries list.`,
        missMessage: (countryName) => `${countryName} is not in this native English-speaking countries list.`,
        countries: [
            "United States of America", "United Kingdom", "Australia", "Canada",
            "New Zealand", "Ireland", "Jamaica", "Bahamas", "Trinidad and Tobago",
            "Guyana", "Belize"
        ]
    }
};

const populationData = {
    "India": 1428627663, "China": 1425671352, "United States of America": 339996563,
    "Indonesia": 277534122, "Pakistan": 240485658, "Nigeria": 223804632,
    "Brazil": 216422446, "Bangladesh": 172954319, "Russia": 144444359,
    "Mexico": 128455567, "Japan": 123294513, "Ethiopia": 126527060,
    "Philippines": 117337368, "Egypt": 112716598, "Vietnam": 98858950,
    "Germany": 83294633, "United Kingdom": 67736802, "France": 64756584,
    "Canada": 38781291, "Argentina": 45773884, "Australia": 26439111,
};

const GuessTheCountry = () => {
    const [selectedMode, setSelectedMode] = useState('populous');
    const currentMode = GAME_MODES[selectedMode];
    // Refs para acceder a los elementos del DOM de forma segura en React
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const infoPanelRef = useRef(null);
    const scoreRef = useRef(null);
    const remainingRef = useRef(null);
    const gameLogicRef = useRef({}); // Para almacenar variables del juego

    useEffect(() => {
        // --- VARIABLES DEL JUEGO Y MAPA ---
        const activeMode = GAME_MODES[selectedMode];
        const targetCountries = activeMode.countries;
        const logic = gameLogicRef.current;
        logic.score = 0;
        logic.foundCountries = new Set();
        logic.gameOver = false;
        const NEUTRAL_COLOR = "#6b7280";

        let svg, g, path, countries, tooltip;
        const loadingDiv = document.getElementById('loading-game');
        if (loadingDiv) {
            loadingDiv.style.display = "block";
            loadingDiv.textContent = "🌍 Loading world map...";
        }

        async function initMap() {
            try {
                const world = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(response => response.json());
                if (loadingDiv) loadingDiv.style.display = "none";

                svg = d3.select(svgRef.current);
                const width = svgRef.current.clientWidth;
                const height = width * 0.5; // Aspect ratio 2:1
                svg.attr("viewBox", `0 0 1200 600`);

                const projection = d3.geoNaturalEarth1().scale(180).translate([1200 / 2, 600 / 2]);
                path = d3.geoPath().projection(projection);

                g = svg.append("g");
                countries = g.selectAll(".country")
                    .data(topojson.feature(world, world.objects.countries).features)
                    .enter()
                    .append("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .on("click", handleCountryClick)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut);

                tooltip = d3.select(tooltipRef.current);
                startGame();

            } catch (error) {
                console.error("Error loading map data:", error);
                if (loadingDiv) loadingDiv.textContent = "⚠️ Error loading map data.";
            }
        }

        function startGame() {
            logic.score = 0;
            logic.foundCountries.clear();
            logic.gameOver = false;

            countries.attr("fill", NEUTRAL_COLOR)
                .classed("country-correct", false)
                .classed("country-incorrect", false);

            updateUI();
            if (infoPanelRef.current) {
                infoPanelRef.current.innerHTML = `
                    <h3>📜 Instructions</h3>
                    <p>Click on the map to guess <strong>${activeMode.targetDescription}</strong>.</p>
                    <p>A correct guess will turn the country <strong>green</strong>. An incorrect guess will turn it <strong>red</strong>. Good luck!</p>
                `;
            }
        }

        function handleCountryClick(event, d) {
            if (logic.gameOver) return;

            const countryElement = d3.select(this);
            const countryName = d.properties.name;

            if (countryElement.classed("country-correct") || countryElement.classed("country-incorrect")) {
                return;
            }

            const isCorrect = targetCountries.includes(countryName);

            if (isCorrect) {
                if (!logic.foundCountries.has(countryName)) {
                    logic.score++;
                    logic.foundCountries.add(countryName);
                    countryElement.classed("country-correct", true);
                    updateInfoPanel(countryName, true);

                    if (logic.foundCountries.size === targetCountries.length) {
                        endGame();
                    }
                }
            } else {
                countryElement.classed("country-incorrect", true);
                updateInfoPanel(countryName, false);
            }

            updateUI();
        }

        function endGame() {
            logic.gameOver = true;
            if (infoPanelRef.current) {
                infoPanelRef.current.innerHTML = `
                    <h3>🏆 Congratulations! 🏆</h3>
                    <p>You've found all ${targetCountries.length} countries in <strong>${activeMode.label}</strong> mode! Your final score is <strong>${logic.score}</strong>.</p>
                    <p>Press the restart button to play again.</p>
                `;
            }
        }

        function updateUI() {
            if (scoreRef.current) scoreRef.current.textContent = logic.score;
            if (remainingRef.current) remainingRef.current.textContent = targetCountries.length - logic.foundCountries.size;
        }

        function updateInfoPanel(countryName, isCorrect) {
            const population = populationData[countryName] || "Not Available";
            const formattedPopulation = typeof population === 'number'
                ? population.toLocaleString('en-US')
                : population;

            const title = isCorrect ? `<h3>Correct! ✅ ${countryName}</h3>` : `<h3>Incorrect ❌ ${countryName}</h3>`;
            const message = isCorrect
                ? `<p>Excellent! ${activeMode.successMessage(countryName)}</p>`
                : `<p>Oops, ${activeMode.missMessage(countryName)}</p>`;

            if (infoPanelRef.current) {
                infoPanelRef.current.innerHTML = `${title}${message}<p><strong>Estimated Population:</strong> ${formattedPopulation}</p>`;
            }
        }

        function handleMouseOver(event, d) {
            const countryName = d.properties.name || "Unknown";
            tooltip
                .style("opacity", 1)
                .html(`<strong>${countryName}</strong>`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        }

        function handleMouseOut() {
            tooltip.style("opacity", 0);
        }

        const restartButton = document.getElementById('restartBtn-game');
        if (restartButton) {
            restartButton.addEventListener('click', startGame);
        }

        initMap();

        // Función de limpieza para cuando el componente se desmonte
        return () => {
            if (restartButton) {
                restartButton.removeEventListener('click', startGame);
            }
            d3.select(svgRef.current).selectAll("*").remove(); // Limpia el SVG
        };

    }, [selectedMode]);

    return (
        <div className="guess-the-country-container">
            <h1>🗺️ {currentMode.title}</h1>

            <div className="mode-selector" aria-label="Game modes">
                {Object.entries(GAME_MODES).map(([modeKey, mode]) => (
                    <button
                        key={modeKey}
                        type="button"
                        className={`mode-button ${selectedMode === modeKey ? 'active' : ''}`}
                        onClick={() => setSelectedMode(modeKey)}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            <div className="game-ui">
                <div className="game-stat">
                    <div className="game-stat-label">Score</div>
                    <div ref={scoreRef} className="game-stat-value">0</div>
                </div>
                <div className="game-stat">
                    <div className="game-stat-label">Countries Left</div>
                    <div ref={remainingRef} className="game-stat-value">{currentMode.countries.length}</div>
                </div>
                <button className="btn" id="restartBtn-game">🔄 Restart Game</button>
            </div>

            <div className="map-container">
                <div id="loading-game" className="loading">🌍 Loading world map...</div>
                <svg ref={svgRef} id="worldMap"></svg>
            </div>

            <div ref={tooltipRef} className="tooltip"></div>

            <div ref={infoPanelRef} className="info-panel">
                {/* El contenido se generará con JavaScript */}
            </div>
        </div>
    );
};

export default GuessTheCountry;
