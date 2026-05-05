import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Stack,
    IconButton
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TerminalIcon from '@mui/icons-material/Terminal';

import apiClient from '../api';

interface SolvingStat {
    challenge_title: string;
    attempts: number;
    completed: boolean;
    best_time: number | null;
}

interface CreatedChallenge {
    challenge_id: string;
    title: string;
    difficulty: string;
}

interface ProfileData {
    stats: SolvingStat[];
    created_challenges: CreatedChallenge[];
}

export const Profile: React.FC = () => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await apiClient.get('/challenges/my_profile/');
            setProfileData(response.data);
        } catch (error) {
            console.error("Failed to fetch profile data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChallenge = async (challengeId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this challenge?");
        if (!confirmDelete) return;

        try {
            await apiClient.delete(`/challenges/${challengeId}/`);
            fetchProfileData(); // Refresh data after deletion
        } catch (error: any) {
            console.error("Failed to delete:", error);
            if (error.response?.status === 403) {
                alert("You do not have permission to delete this challenge.");
            } else {
                alert("Error deleting challenge.");
            }
        }
    };

    // Helper to color-code difficulty chips
    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'EZ': return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)' };
            case 'MD': return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)' };
            case 'HD': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' };
            default: return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)' };
        }
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                minHeight: '100vh', '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
                bgcolor: '#020617' 
            }}>
                <CircularProgress sx={{ color: '#3b82f6' }} />
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Box sx={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                minHeight: '100vh', '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
                bgcolor: '#020617' 
            }}>
                <Typography color="error">Failed to load profile data.</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
                background: 'radial-gradient(circle at top center, #1e293b 0%, #020617 100%)',
                color: '#f8fafc',
                py: { xs: 4, md: 6 }
            }}
        >
            <Container maxWidth="lg">
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AccountCircleIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#3b82f6' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                            My Profile
                        </Typography>
                    </Box>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/dashboard')}
                        sx={{ 
                            textTransform: 'none', color: '#94a3b8', fontWeight: 600, 
                            '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' },
                            display: { xs: 'none', sm: 'flex' } // Hide text on small mobile screens to save space
                        }}
                    >
                        Back to Dashboard
                    </Button>
                    <IconButton 
                        onClick={() => navigate('/dashboard')}
                        sx={{ color: '#94a3b8', display: { xs: 'flex', sm: 'none' } }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Box>

                <Grid container spacing={4}>
                    {/* LEFT COLUMN: Solving Stats */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                height: '100%',
                                borderRadius: 4,
                                bgcolor: 'rgba(15, 23, 42, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#f8fafc' }}>
                                Combat Log (Solving Stats)
                            </Typography>

                            {profileData.stats.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <TerminalIcon sx={{ fontSize: 40, color: '#475569', mb: 2 }} />
                                    <Typography sx={{ color: '#94a3b8' }}>No challenges attempted yet.</Typography>
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table sx={{ minWidth: 300 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', pl: 0 }}>Challenge</TableCell>
                                                <TableCell sx={{ color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                                                <TableCell align="center" sx={{ color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Tries</TableCell>
                                                <TableCell align="right" sx={{ color: '#64748b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', pr: 0 }}>Best Time</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {profileData.stats.map((stat, idx) => (
                                                <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                                                    <TableCell sx={{ color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.05)', pl: 0, fontWeight: 500 }}>
                                                        {stat.challenge_title}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <Chip
                                                            icon={stat.completed ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                                                            label={stat.completed ? 'Passed' : 'Failed'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: stat.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                color: stat.completed ? '#10b981' : '#ef4444',
                                                                fontWeight: 600,
                                                                '& .MuiChip-icon': { color: 'inherit' }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        {stat.attempts}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: '#34d399', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', pr: 0, fontFamily: 'monospace' }}>
                                                        {stat.best_time ? `${stat.best_time.toFixed(3)}s` : '--'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Maker Portfolio */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                height: '100%',
                                borderRadius: 4,
                                bgcolor: 'rgba(15, 23, 42, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                                    Maker Portfolio
                                </Typography>
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    onClick={() => navigate('/workshop')}
                                    sx={{ textTransform: 'none', borderRadius: 2, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                                >
                                    + New
                                </Button>
                            </Box>

                            {profileData.created_challenges.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <TerminalIcon sx={{ fontSize: 40, color: '#475569', mb: 2 }} />
                                    <Typography sx={{ color: '#94a3b8' }}>No challenges created yet.</Typography>
                                </Box>
                            ) : (
                                <Stack spacing={2}>
                                    {profileData.created_challenges.map((challenge) => {
                                        const diffStyle = getDifficultyColor(challenge.difficulty);
                                        return (
                                            <Box
                                                key={challenge.challenge_id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 2,
                                                    bgcolor: 'rgba(2, 6, 23, 0.4)',
                                                    borderRadius: 3,
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { borderColor: 'rgba(255,255,255,0.15)', bgcolor: 'rgba(2, 6, 23, 0.6)' }
                                                }}
                                            >
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, color: '#e2e8f0', mb: 0.5 }}>
                                                        {challenge.title}
                                                    </Typography>
                                                    <Chip
                                                        label={challenge.difficulty}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 800,
                                                            color: diffStyle.color,
                                                            bgcolor: diffStyle.bg,
                                                            border: `1px solid ${diffStyle.border}`
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/workshop/${challenge.challenge_id}`)}
                                                        sx={{ color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteChallenge(challenge.challenge_id)}
                                                        sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};