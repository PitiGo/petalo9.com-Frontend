import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from './firebase-config';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('auth-token');
        setIsLoggedIn(!!token);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            
            localStorage.setItem('auth-token', token);
            localStorage.setItem('user', email);
            localStorage.setItem('userRole', "admin");

            console.log('Login successful:', email);
            console.log('userRole:', "admin");

            setIsLoggedIn(true);
            navigate('/edit');
           
        } catch (error) {
            console.error('Error during login:', error);
            // Display error message to user
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            setIsLoggedIn(false);
            navigate('/');
            console.log('Logout successful');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (isLoggedIn) {
        return (
            <div>
                <p>You are logged in.</p>
                <button onClick={handleLogout}>Deslogearse</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Email:
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            <label>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginForm;