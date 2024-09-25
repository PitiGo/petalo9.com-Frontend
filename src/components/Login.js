import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase-config'; // Ensure this import is correct

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate here

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            console.log('Login successful:', userCredential.user);
      
            // Store the token in localStorage
            localStorage.setItem('auth-token', token);
            localStorage.setItem('user', email);
            localStorage.setItem('userRole', "admin");

            console.log('Login successful:', email);
            console.log('userRole:', "admin");

            // Navigate to the main route
            navigate('/edit');
           
        } catch (error) {
            console.error('Error during login:', error);
            // Display error message to user
        }
    };

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
