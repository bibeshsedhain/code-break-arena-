
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Card,
    CardContent,
    CardActions,
    Box,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    Stack
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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
                const response = await apiClient.get('/challenges/');
                setChallenges(response.data);
            } catch (error) {
                console.error('Failed to fetch challenges:', error);
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

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                flexGrow: 1,
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)'
            }}
        >
            {/* Navbar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderBottom: '1px solid #e5e7eb'
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar
                        disableGutters
                        sx={{ justifyContent: 'space-between', py: 1 }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                        >
                            Challenge Hub
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/workshop')}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 2.5,
                                    fontWeight: 600
                                }}
                            >
                                Create
                            </Button>

                            <IconButton
                                onClick={() => navigate('/profile')}
                            >
                                <AccountCircleIcon />
                            </IconButton>

                            <IconButton
                                onClick={handleLogout}
                                color="error"
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Content */}
            <Container maxWidth="md" sx={{ py: 8 }}>
                {/* Header */}
                <Box mb={6}>
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, mb: 1 }}
                    >
                        Active Challenges
                    </Typography>


                </Box>

                {/* Challenge List */}
                <Stack spacing={3}>
                    {challenges.map((challenge) => (
                        <Card
                            key={challenge.challenge_id}
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid #e5e7eb',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow:
                                        '0 10px 25px rgba(0,0,0,0.08)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1.5}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {challenge.title}
                                    </Typography>

                                    <Chip
                                        label={challenge.difficulty}
                                        size="small"
                                        sx={{
                                            fontWeight: 500,
                                            borderRadius: 1.5
                                        }}
                                    />
                                </Box>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {challenge.description}
                                </Typography>
                            </CardContent>

                            <Divider />

                            <CardActions sx={{ p: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    endIcon={<PlayArrowIcon />}
                                    onClick={() =>
                                        navigate(
                                            `/arena/${challenge.challenge_id}`
                                        )
                                    }
                                    sx={{
                                        py: 1.4,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Enter Arena
                                </Button>
                            </CardActions>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {challenges.length === 0 && (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 10,
                                border: '2px dashed #d1d5db',
                                borderRadius: 3,
                                backgroundColor: '#ffffff'
                            }}
                        >
                            <Typography
                                variant="h6"
                                color="text.secondary"
                            >
                                No challenges yet
                            </Typography>

                            <Button
                                sx={{ mt: 3, textTransform: 'none' }}
                                variant="contained"
                                onClick={() =>
                                    navigate('/workshop')
                                }
                            >
                                Create your first challenge
                            </Button>
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
};

