import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { auth } from '../firebase';

interface Challenge {
    challenge_id: string;
    title: string;
    difficulty: string;
    description: string;
}

export const Dashboard: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                // The apiClient automatically attaches the Firebase token!
                const response = await apiClient.get('/challenges/');
                setChallenges(response.data);
            } catch (error) {
                console.error("Failed to fetch challenges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    if (loading) return <div>Loading the Arena Lobby...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Challenge Dashboard</h2>
                <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {challenges.map((challenge) => (
                    <div key={challenge.challenge_id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                        <h3>{challenge.title} <span style={{ fontSize: '0.8em', color: 'gray' }}>({challenge.difficulty})</span></h3>
                        <p>{challenge.description}</p>
                        <button 
                            onClick={() => navigate(`/arena/${challenge.challenge_id}`)}
                            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Enter Arena
                        </button>
                    </div>
                ))}
                {challenges.length === 0 && <p>No challenges available yet. Go make some in the Django Admin!</p>}
            </div>
        </div>
    );
};