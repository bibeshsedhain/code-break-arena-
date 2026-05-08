import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Stack, 
    CircularProgress, 
    Paper,
    Avatar,
    Fade
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import CodeIcon from '@mui/icons-material/Code';
import apiClient from '../api';

interface LeaderboardEntry {
    username: string;
    first_name?: string;
    best_time: number;
    attempts: number;
}

interface LeaderboardProps {
    challengeId: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ challengeId }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await apiClient.get(`/challenges/${challengeId}/leaderboard/`);
                setEntries(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        if (challengeId) {
            fetchLeaderboard();
        }
    }, [challengeId]);

    const getTrophyColor = (index: number) => {
        if (index === 0) return '#fbbf24'; // Gold
        if (index === 1) return '#94a3b8'; // Silver
        if (index === 2) return '#b45309'; // Bronze
        return '#475569'; // Default rank color
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} sx={{ color: '#3b82f6' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                <EmojiEventsIcon sx={{ color: '#fbbf24', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
                    Top Hackers
                </Typography>
            </Box>

            {entries.length === 0 ? (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        background: 'rgba(15, 23, 42, 0.4)', 
                        backdropFilter: 'blur(8px)',
                        border: '1px dashed rgba(255,255,255,0.1)', 
                        borderRadius: 4 
                    }}
                >
                    <CodeIcon sx={{ color: '#64748b', fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        The arena is quiet.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        No one has cracked this target yet. Be the first!
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {entries.map((entry, index) => {
                        // Guest Logic Integration
                        const isGuest = entry.username.startsWith('guest_');
                        const displayName = entry.first_name || (isGuest ? `Ghost ${entry.username.slice(-4).toUpperCase()}` : entry.username.split('@')[0]);
                        
                        return (
                            <Fade in={true} timeout={300 + (index * 100)} key={index}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: index === 0 ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)' : 'rgba(15, 23, 42, 0.6)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid',
                                        borderColor: index === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 3,
                                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateX(4px)',
                                            borderColor: index === 0 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255, 255, 255, 0.15)',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontWeight: 800, 
                                                color: getTrophyColor(index),
                                                minWidth: '28px',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {index < 3 ? <EmojiEventsIcon /> : `#${index + 1}`}
                                        </Typography>
                                        
                                        <Avatar 
                                            sx={{ 
                                                width: 36, 
                                                height: 36, 
                                                bgcolor: isGuest ? '#334155' : '#3b82f6',
                                                fontSize: '0.9rem',
                                                fontWeight: 700
                                            }}
                                        >
                                            {displayName.charAt(0).toUpperCase()}
                                        </Avatar>

                                        <Typography variant="body1" sx={{ fontWeight: index === 0 ? 800 : 600, color: index === 0 ? '#fbbf24' : '#e2e8f0' }}>
                                            {displayName}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: 'right' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                            <TimerIcon sx={{ fontSize: 14, color: '#34d399' }} />
                                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#34d399' }}>
                                                {entry.best_time}ms
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                            {entry.attempts} {entry.attempts === 1 ? 'attempt' : 'attempts'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Fade>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};