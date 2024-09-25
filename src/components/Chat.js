import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
// Conectarse al servidor de Socket.IO
const apiUrl = process.env.REACT_APP_API_URL;
const socket = io(apiUrl); // Asegúrate de que la URL coincida con tu servidor



const Message = ({ text, from }) => (
    <div>
        <strong>{from === 'user' ? 'Usuario' : 'AI'}:</strong> {text}
    </div>
);

// Estilos convertidos a formato de objeto JavaScript
const styles = {
    chatBox: {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        width: '300px',
        height: '400px',
        borderRadius: '15px',
        backgroundColor: '#f0f0f0',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
    },
    messageArea: {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '10px',
        backgroundColor: '#fff',
        borderTop: '1px solid #ddd',
        borderBottom: '1px solid #ddd',
    },
    inputArea: {
        display: 'flex',
        padding: '10px',
        backgroundColor: '#f0f0f0',
    },
    messageInput: {
        flexGrow: 1,
        padding: '8px 12px',
        marginRight: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    sendButton: {
        padding: '8px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    toggleChat: (isChatVisible) => ({
        position: 'fixed',
        bottom: isChatVisible ? '400px' : '10px',
        right: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '10px',
        cursor: 'pointer',
        zIndex: 2001,
    }),
};

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [aiMessage, setAiMessage] = useState('');
    const [isChatVisible, setIsChatVisible] = useState(false);
    const messageAreaRef = useRef(null);

    useEffect(() => {
        socket.on('chat message', (msg) => {
            console.log("Entra en other");
            setMessages((prevMessages) => [...prevMessages, { text: msg, from: 'other' }]);
        });

        socket.on('chat response', (response) => {
            if (response.includes('/Fin')) {
                setMessages(prev => [...prev, { text: aiMessage + response.replace('/Fin', ''), from: 'AI' }]);
                setAiMessage('');
            } else {
                setAiMessage(prev => prev + response);
            }
        });

        return () => {
            socket.off('chat message');
            socket.off('chat response');
        };
    }, [aiMessage]);

    const sendMessage = () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput !== '') {
            setMessages((prevMessages) => [...prevMessages, { text: trimmedInput, from: 'user' }]);
            socket.emit('chat message', trimmedInput);
            setInputValue('');
        }
    };

    useEffect(() => {
        setTimeout(() => {
            if (messageAreaRef.current) {
                const { scrollHeight, clientHeight } = messageAreaRef.current;
                const maxScrollTop = scrollHeight - clientHeight;
                messageAreaRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
            }
        }, 0);
    }, [messages, aiMessage]); // Incluye aiMessage en las dependencias
    

    const handleInputChange = (e) => setInputValue(e.target.value);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    const toggleChat = () => setIsChatVisible(!isChatVisible);

    return (
        <div>
            <button onClick={toggleChat} style={styles.toggleChat(isChatVisible)}>
                {isChatVisible ? 'Ocultar Chat' : 'Mostrar Chat'}
            </button>
            {isChatVisible && (
                <div style={styles.chatBox}>
                    <div style={styles.messageArea} ref={messageAreaRef}>
                        {messages.map((msg, index) => (
                            <Message key={index} text={msg.text} from={msg.from} />
                        ))}
                        {/* Aquí se muestra el mensaje de la AI en construcción */}
                        {aiMessage && <Message text={aiMessage} from="AI" />}
                    </div>

                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu mensaje..."
                            style={styles.messageInput}
                        />
                        <button onClick={sendMessage} style={styles.sendButton}>
                            Enviar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;