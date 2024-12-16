import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/GamePage.css';
import snakeImage from '../images/snake-game.png';
import snake3dImage from '../images/snake-3d.png';
import pongImage from '../images/pong-game.png';
import footballImage from '../images/mamvsreptiles.webp';
import io from 'socket.io-client';

const GamesPage = () => {
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
    const [sockets, setSockets] = useState({ sala1: null, sala2: null });

    useEffect(() => {
        const socketSala1 = io('https://football-online-3d.dantecollazzi.com', {
            transports: ['websocket'],
            path: '/sala1/socket.io',
        });

        const socketSala2 = io('https://football-online-3d.dantecollazzi.com', {
            transports: ['websocket'],
            path: '/sala2/socket.io',
        });

        setSockets({ sala1: socketSala1, sala2: socketSala2 });

        const handleGameStateUpdate = (sala) => (gameState) => {
            if (gameState?.connectedPlayers) {
                const connectedPlayers = gameState.connectedPlayers.filter(player => 
                    player.team === 'left' || player.team === 'right'
                );

                setRoomStates(prev => ({
                    ...prev,
                    [sala]: {
                        ...prev[sala],
                        playerCount: connectedPlayers.length,
                        players: connectedPlayers
                    }
                }));
            }
        };

        const handleGameStateInfo = (sala) => (info) => {
            setRoomStates(prev => ({
                ...prev,
                [sala]: {
                    ...prev[sala],
                    gameInProgress: info.currentState === 'playing'
                }
            }));
        };

        socketSala1.on('gameStateUpdate', handleGameStateUpdate('sala1'));
        socketSala2.on('gameStateUpdate', handleGameStateUpdate('sala2'));
        
        socketSala1.on('gameStateInfo', handleGameStateInfo('sala1'));
        socketSala2.on('gameStateInfo', handleGameStateInfo('sala2'));

        return () => {
            socketSala1.disconnect();
            socketSala2.disconnect();
        };
    }, []);

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

    const handleJoinRoom = (roomId) => {
        window.open(`https://football-online-3d.dantecollazzi.com/${roomId}`, '_blank');
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