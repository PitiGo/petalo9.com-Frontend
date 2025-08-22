import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import './GuessTheCountry.css';

const GuessTheCountry = () => {
    // Refs para acceder a los elementos del DOM de forma segura en React
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const infoPanelRef = useRef(null);
    const scoreRef = useRef(null);
    const remainingRef = useRef(null);
    const gameLogicRef = useRef({}); // Para almacenar variables del juego

    useEffect(() => {
        // --- DATA DEL JUEGO ---
        const TOP_15_COUNTRIES = [
            "India", "China", "United States of America", "Indonesia", "Pakistan",
            "Nigeria", "Brazil", "Bangladesh", "Russia", "Mexico",
            "Japan", "Ethiopia", "Philippines", "Egypt", "Vietnam"
        ];

        const populationData = {
            "India": 1428627663, "China": 1425671352, "United States of America": 339996563,
            "Indonesia": 277534122, "Pakistan": 240485658, "Nigeria": 223804632,
            "Brazil": 216422446, "Bangladesh": 172954319, "Russia": 144444359,
            "Mexico": 128455567, "Japan": 123294513, "Ethiopia": 126527060,
            "Philippines": 117337368, "Egypt": 112716598, "Vietnam": 98858950,
            "Germany": 83294633, "United Kingdom": 67736802, "France": 64756584,
            "Canada": 38781291, "Argentina": 45773884, "Australia": 26439111,
        };

        // --- VARIABLES DEL JUEGO Y MAPA ---
        const logic = gameLogicRef.current;
        logic.score = 0;
        logic.foundCountries = new Set();
        logic.gameOver = false;
        const NEUTRAL_COLOR = "#6b7280";

        let svg, g, path, countries, tooltip;
        const loadingDiv = document.getElementById('loading-game');

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
                    <p>Click on the map to guess the world's <strong>15 most populous countries</strong>.</p>
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

            const isCorrect = TOP_15_COUNTRIES.includes(countryName);

            if (isCorrect) {
                if (!logic.foundCountries.has(countryName)) {
                    logic.score++;
                    logic.foundCountries.add(countryName);
                    countryElement.classed("country-correct", true);
                    updateInfoPanel(countryName, true);

                    if (logic.foundCountries.size === TOP_15_COUNTRIES.length) {
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
                    <p>You've found all 15 most populous countries! Your final score is <strong>${logic.score}</strong>.</p>
                    <p>Press the restart button to play again.</p>
                `;
            }
        }

        function updateUI() {
            if (scoreRef.current) scoreRef.current.textContent = logic.score;
            if (remainingRef.current) remainingRef.current.textContent = TOP_15_COUNTRIES.length - logic.foundCountries.size;
        }

        function updateInfoPanel(countryName, isCorrect) {
            const population = populationData[countryName] || "Not Available";
            const formattedPopulation = typeof population === 'number'
                ? population.toLocaleString('en-US')
                : population;

            const title = isCorrect ? `<h3>Correct! ✅ ${countryName}</h3>` : `<h3>Incorrect ❌ ${countryName}</h3>`;
            const message = isCorrect
                ? `<p>Excellent! ${countryName} is one of the top 15 most populous countries.</p>`
                : `<p>Oops, ${countryName} is not in the top 15. Keep trying!</p>`;

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

    }, []); // El array vacío asegura que este efecto se ejecute solo una vez

    return (
        <div className="guess-the-country-container">
            <h1>🗺️ Guess the 15 Most Populous Countries</h1>

            <div className="game-ui">
                <div className="game-stat">
                    <div className="game-stat-label">Score</div>
                    <div ref={scoreRef} className="game-stat-value">0</div>
                </div>
                <div className="game-stat">
                    <div className="game-stat-label">Countries Left</div>
                    <div ref={remainingRef} className="game-stat-value">15</div>
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
