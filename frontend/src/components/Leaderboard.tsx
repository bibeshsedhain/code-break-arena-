import React, { useEffect, useState } from 'react';
import apiClient from '../api';

interface LeaderboardEntry {
    username: string;
    best_time: number;
    attempts: number;
}

interface LeaderboardProps {
    challengeId: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ challengeId }) => {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    // Toggle state: default to false (collapsed) to save space
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await apiClient.get(`/challenges/${challengeId}/leaderboard/`);
                setLeaders(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (challengeId) {
            fetchLeaderboard();
        }
    }, [challengeId]);

    // Helper to clean up the display name
    const formatDisplayName = (username: string) => {
        if (!username) return "Unknown Coder";
        
        // If the backend sent an email, just show the part before the @
        if (username.includes('@')) {
            return username.split('@')[0];
        }
        
        // If the backend sent the raw Firebase UID (long random string), truncate it nicely
        if (username.length > 10) {
            return `Coder_${username.substring(0, 5)}`;
        }
        
        return username;
    };

    if (loading) return <p style={{ fontSize: '14px', color: 'gray' }}>Loading Top Coders...</p>;

    if (leaders.length === 0) return null; // Hide completely if no one has passed yet

    return (
        <div style={{ marginTop: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', overflow: 'hidden', fontFamily: 'sans-serif' }}>
            
            {/* Clickable Header for Toggle */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ padding: '15px', backgroundColor: '#e9ecef', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dde2e6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
            >
                <h4 style={{ margin: 0, color: '#333', fontSize: '15px' }}>🏆 Optimization Leaderboard</h4>
                <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: '#6c757d', fontSize: '12px' }}>
                    ▼
                </span>
            </div>

            {/* Collapsible Table Content */}
            {isExpanded && (
                <div style={{ padding: '0 15px 15px 15px' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '8px 4px', color: '#495057' }}>Rank</th>
                                <th style={{ padding: '8px 4px', color: '#495057' }}>Coder</th>
                                <th style={{ padding: '8px 4px', color: '#495057' }}>Time (s)</th>
                                <th style={{ padding: '8px 4px', color: '#495057', textAlign: 'center' }}>Attempts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders.map((leader, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                    <td style={{ padding: '10px 4px', fontWeight: 'bold', color: '#6c757d' }}>
                                        #{index + 1}
                                    </td>
                                    <td style={{ padding: '10px 4px', fontWeight: '500', color: '#343a40' }}>
                                        {formatDisplayName(leader.username)}
                                    </td>
                                    <td style={{ padding: '10px 4px', color: '#28a745', fontWeight: 'bold' }}>
                                        {/* Format to exactly 3 decimal places */}
                                        {leader.best_time.toFixed(3)}
                                    </td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#6c757d' }}>
                                        {leader.attempts}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};