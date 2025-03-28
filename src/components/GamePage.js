import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/GamePage.css';
import snakeImage from '../images/snake-game.png';
import snake3dImage from '../images/snake-3d.png';
import pongImage from '../images/pong-game.png';
import footballImage from '../images/mamvsreptiles.webp';
import io from 'socket.io-client';

const GamesPage = () => {
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState(null);
    const [roomStates, setRoomStates] = useState({
        sala1: {
            playerCount: 0,
            players: [],
            gameInProgress: false
        },
        sala2: {
            playerCount: 0,
            players: [],
            gameInProgress: false
        }
    });
    const [sockets, setSockets] = useState({});

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
        let socketConnections = {};
        const availableRooms = ['sala1', 'sala2']; // Easily expandable room list

        if (!window.location.pathname.includes('/games/mammals-vs-reptiles')) {
            // Initialize sockets for each room
            availableRooms.forEach(roomId => {
                socketConnections[roomId] = io('https://football-online-3d.dantecollazzi.com', {
                    transports: ['websocket'],
                    path: `/${roomId}/socket.io`,
                    reconnection: false
                });

                // Configure event handlers for each socket
                socketConnections[roomId].on('gameStateUpdate', (gameState) => {
                    if (gameState?.connectedPlayers) {
                        const connectedPlayers = gameState.connectedPlayers.filter(player =>
                            player.team === 'left' || player.team === 'right'
                        );

                        setRoomStates(prev => ({
                            ...prev,
                            [roomId]: {
                                ...prev[roomId],
                                playerCount: connectedPlayers.length,
                                players: connectedPlayers
                            }
                        }));
                    }
                });

                socketConnections[roomId].on('gameStateInfo', (info) => {
                    setRoomStates(prev => ({
                        ...prev,
                        [roomId]: {
                            ...prev[roomId],
                            gameInProgress: info.currentState === 'playing'
                        }
                    }));
                });
            });

            setSockets(socketConnections);

            // Function to update all rooms status
            const updateAllRoomsStatus = async () => {
                for (const roomId of availableRooms) {
                    const data = await fetchRoomStatus(roomId);
                    if (data) {
                        setRoomStates(prev => ({
                            ...prev,
                            [roomId]: {
                                playerCount: data.playerCount || 0,
                                players: data.players || [],
                                gameInProgress: data.gameInProgress || false
                            }
                        }));
                    }
                }
            };

            // Initial update
            updateAllRoomsStatus();

            // Set up periodic updates
            const statusInterval = setInterval(updateAllRoomsStatus, 10000);

            // Cleanup function
            return () => {
                clearInterval(statusInterval);
                Object.values(socketConnections).forEach(socket => {
                    if (socket) socket.disconnect();
                });
            };
        }
    }, []);

    // Improved room join handler
    const handleJoinRoom = (roomId) => {
        // Disconnect all monitoring sockets before navigating
        Object.values(sockets).forEach(socket => {
            if (socket) socket.disconnect();
        });

        // Navigate to specific room
        navigate(`/games/mammals-vs-reptiles?room=${roomId}`);
    };

    const games = {
        singlePlayer: [
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
            }
        ],
        multiplayer: [
            {
                id: 'mammals-vs-reptiles',
                name: 'Mammals vs Reptiles',
                description: 'An exciting 3D football game where mammals compete against reptiles in epic matches!',
                image: footballImage,
                rooms: [
                    {
                        id: 'sala1',
                        name: 'Room 1',
                        description: 'Main game room'
                    },
                    {
                        id: 'sala2',
                        name: 'Room 2',
                        description: 'Secondary game room'
                    }
                ]
            }
        ]
    };

    const SinglePlayerGameCard = ({ game }) => (
        <Link to={`/games/${game.id}`} className="game-card">
            <div className="game-card-image-container">
                <img
                    src={game.image}
                    alt={game.name}
                    className="game-card-image"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x180?text=Game+Preview';
                    }}
                />
            </div>
            <div className="game-card-content">
                <h3>{game.name}</h3>
                <p>{game.description}</p>
            </div>
        </Link>
    );

    const MultiplayerGameCard = ({ game }) => (
        <div className="game-card" onClick={() => setSelectedGame(game)}>
            <div className="game-card-image-container">
                <img
                    src={game.image}
                    alt={game.name}
                    className="game-card-image"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x180?text=Game+Preview';
                    }}
                />
            </div>
            <div className="game-card-content">
                <h3>{game.name}</h3>
                <p>{game.description}</p>
            </div>
        </div>
    );

    const RoomCard = ({ room }) => {
        const roomState = roomStates[room.id];

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
                        <span className="player-count">
                            {roomState.playerCount} {roomState.playerCount === 1 ? 'player' : 'players'} online
                        </span>

                        {roomState.players.length > 0 && (
                            <div className="players-list">
                                <div className="team">
                                    <h4>Mammals</h4>
                                    {roomState.players
                                        .filter(p => p.team === 'left')
                                        .map(player => (
                                            <span key={player.id} className="player-name mammals">
                                                {player.name}
                                            </span>
                                        ))
                                    }
                                </div>
                                <div className="team">
                                    <h4>Reptiles</h4>
                                    {roomState.players
                                        .filter(p => p.team === 'right')
                                        .map(player => (
                                            <span key={player.id} className="player-name reptiles">
                                                {player.name}
                                            </span>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="join-button"
                >
                    Join Room
                </button>
            </div>
        );
    };

    if (selectedGame) {
        return (
            <div className="games-page">
                <h2>{selectedGame.name} - Available Rooms</h2>
                <button
                    onClick={() => setSelectedGame(null)}
                    className="back-button"
                >
                    Back to Games
                </button>
                <div className="rooms-grid">
                    {selectedGame.rooms.map(room => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="games-page">
            <h1>Games Collection</h1>
            <section className="games-section">
                <h2>Single Player Games</h2>
                <div className="games-grid">
                    {games.singlePlayer.map((game) => (
                        <SinglePlayerGameCard key={game.id} game={game} />
                    ))}
                </div>
            </section>

            <section className="games-section">
                <h2>Multiplayer Games</h2>
                <div className="games-grid">
                    {games.multiplayer.map((game) => (
                        <MultiplayerGameCard key={game.id} game={game} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default GamesPage;