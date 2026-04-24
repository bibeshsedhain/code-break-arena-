import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const navigate = useNavigate();

    const handleAuthentication = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (isRegistering) {
                // Execute Account Creation Logic
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                // Execute Standard Login Logic
                await signInWithEmailAndPassword(auth, email, password);
            }
            // Route the user to the application dashboard upon success
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>{isRegistering ? 'Register for Code-Break' : 'Login to Code-Break'}</h2>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleAuthentication} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ padding: '10px' }}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                    {isRegistering ? 'Sign Up' : 'Sign In'}
                </button>
            </form>
            
            <button 
                onClick={() => setIsRegistering(!isRegistering)} 
                style={{ marginTop: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
            >
                {isRegistering ? 'Already have an account? Log in' : 'Need an account? Register'}
            </button>
        </div>
    );
};