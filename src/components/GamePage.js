import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

import '../css/GamePage.css';
import footballImage from '../images/mamvsreptiles.webp';
import snakeImage from '../images/snake-game.png';
import snake3dImage from '../images/snake-3d.png';
import pongImage from '../images/pong-game.png';
import handInvadersImage from '../images/hand-invaders-preview.png';
import supermarcosImage from '../images/supermarcos.png';
import guessCountryImage from '../images/guess-country.png';

const GamesPage = () => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [roomStates, setRoomStates] = useState({
        room1: {
            playerCount: 0,
            players: [],
            gameInProgress: false
        },
        room2: {
            playerCount: 0,
            players: [],
            gameInProgress: false
        }
    });

    // Generic function to fetch room status
    const fetchRoomStatus = async (roomId) => {
        try {
            const response = await fetch(`https://football-online-3d.dantecollazzi.com/${roomId}/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.warn(`${roomId} status response not OK:`, response.status);
                return null;
            }
        } catch (error) {
            console.log(`Error fetching ${roomId} status:`, error.message);
            return null;
        }
    };

    useEffect(() => {
        const availableRooms = ['room1', 'room2'];

        const updateAllRoomsStatus = async () => {
            let newRoomStates = {};
            for (const roomId of availableRooms) {
                const data = await fetchRoomStatus(roomId);
                newRoomStates[roomId] = {
                    playerCount: data?.playerCount || 0,
                    players: data?.players || [],
                    gameInProgress: data?.gameInProgress || false,
                    ...(data === null && { playerCount: 0, players: [], gameInProgress: false })
                };
            }
            setRoomStates(prev => ({ ...prev, ...newRoomStates }));
        };

        updateAllRoomsStatus();
        const statusInterval = setInterval(updateAllRoomsStatus, 10000);

        return () => {
            clearInterval(statusInterval);
        };
    }, []);

    const handleJoinRoom = (roomIdNumber) => {
        const gameUrl = `https://football-online-3d.dantecollazzi.com?room=${roomIdNumber}`;
        window.open(gameUrl, '_blank', 'noopener,noreferrer');
    };

    // Lista de juegos hardcodeada para simplificar
    const gamesList = [
        {
            id: 'snake',
            name: 'Snake Classic',
            description: 'The classic Snake game. Guide the snake, collect food, and try not to hit the walls!',
            image: snakeImage
        },
        {
            id: 'SnakeGame3D',
            name: 'Snake 3D',
            description: 'A modern 3D twist on the classic Snake game. Experience snake-gaming in a whole new dimension!',
            image: snake3dImage
        },
        {
            id: 'pong',
            name: 'Pong',
            description: 'Classic arcade game. Challenge yourself against the AI in this timeless tennis-style game.',
            image: pongImage
        },
        {
            id: 'hand-invaders',
            name: 'Hand Invaders',
            description: 'Defend against invaders using your hand gestures recognized by your camera!',
            image: handInvadersImage
        },
        {
            id: 'supermarcos',
            name: 'SuperMarcos',
            description: 'A 2D platformer adventure game with levels, enemies, and power-ups.',
            image: supermarcosImage
        },
        {
            id: 'guess-the-country',
            name: 'Guess The Country',
            description: 'Test your geography knowledge! Click on the map to guess the 15 most populous countries.',
            image: guessCountryImage
        }
    ];



    const multiplayerGame = {
        id: 'mammals-vs-reptiles',
        name: 'Mammals vs Reptiles',
        description: 'An exciting 3D football game where mammals compete against reptiles in epic matches!',
        image: footballImage,
        rooms: [
            { id: 'room1', name: 'Room 1', description: 'Main game room', roomIdNumber: 1 },
            { id: 'room2', name: 'Room 2', description: 'Secondary game room', roomIdNumber: 2 }
        ]
    };

    const ItemCard = ({ item }) => {
        // Verificar que el item existe y tiene las propiedades necesarias
        if (!item || !item.id) {
            return null;
        }

        return (
            <Link to={`/games/${item.id}`} className="game-card">
                <div className="game-card-image-container">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="game-card-image"
                    />
                </div>
                <div className="game-card-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                </div>
            </Link>
        );
    };

    const MultiplayerGameCard = ({ game }) => (
        <div className="game-card" onClick={() => setSelectedGame(game)}>
            <div className="game-card-image-container">
                <img src={game.image} alt={game.name} className="game-card-image" />
            </div>
            <div className="game-card-content">
                <h3>{game.name}</h3>
                <p>{game.description}</p>
            </div>
        </div>
    );

    const RoomCard = ({ room }) => {
        const roomState = roomStates[room.id] || { playerCount: 0, players: [], gameInProgress: false };

        return (
            <div key={room.id} className="room-card">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <div className="room-status">
                    <div className="game-status">
                        <span className={`status-indicator ${roomState.gameInProgress ? 'in-progress' : 'waiting'}`}>
                            {roomState.gameInProgress ? 'Game in Progress' : 'Waiting for Players'}
                        </span>
                    </div>
                    <div className="players-info">
                        <span className="player-count">{roomState.playerCount} {roomState.playerCount === 1 ? 'player' : 'players'} online</span>
                        {roomState.players.length > 0 && (
                            <div className="players-list">
                                <div className="team">
                                    <h4>Mammals</h4>
                                    {roomState.players.filter(p => p.team === 'left').map(player => (
                                        <span key={player.id} className="player-name mammals">{player.name}</span>
                                    ))}
                                </div>
                                <div className="team">
                                    <h4>Reptiles</h4>
                                    {roomState.players.filter(p => p.team === 'right').map(player => (
                                        <span key={player.id} className="player-name reptiles">{player.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={() => handleJoinRoom(room.roomIdNumber)} className="join-button">Join Room</button>
            </div>
        );
    };

    if (selectedGame) {
        return (
            <div className="games-page">
                <h2>{selectedGame.name} - Available Rooms</h2>
                <button onClick={() => setSelectedGame(null)} className="back-button">Back to Games</button>
                <div className="rooms-grid">
                    {selectedGame.rooms.map(room => <RoomCard key={room.id} room={room} />)}
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Games & Tools - Dante Collazzi | Interactive Web Experiences"
                description="Interactive web games, tools, and demos created by Dante Collazzi. Built with modern web technologies including JavaScript, React, and Three.js."
                name="Dante Collazzi"
                type="website"
            />
            <div className="games-page">
                <h1>Games</h1>
                <p>Play some classic and custom-built games directly in your browser.</p>
                <div className="games-grid">
                    {gamesList.map((game) => (
                        <ItemCard key={game.id} item={game} />
                    ))}
                </div>
                <section className="games-section">
                    <h2>Multiplayer Games</h2>
                    <div className="games-grid">
                        <MultiplayerGameCard game={multiplayerGame} />
                    </div>
                </section>
            </div>
        </>
    );
};

export default GamesPage;