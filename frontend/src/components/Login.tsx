import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    TextField,
    Paper,
    Stack,
    Alert,
    Divider,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleAuthentication = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        try {
            await signInAnonymously(auth);
            navigate('/dashboard');
        } catch {
            setError("Guest access is currently unavailable.");
        }
    };

    // ✅ Shared input styles (clean + reusable)
    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            color: '#f8fafc',
            borderRadius: '12px',
            backgroundColor: 'rgba(2, 6, 23, 0.4)',

            '& fieldset': {
                borderColor: 'rgba(255,255,255,0.1)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.2)',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
            },

            // ✅ Placeholder fix
            '& input::placeholder': {
                color: '#94a3b8',
                opacity: 1,
            },

            // ✅ Autofill fix (Chrome)
            '& input:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 100px rgba(2, 6, 23, 0.4) inset',
                WebkitTextFillColor: '#f8fafc',
            },

            // ✨ Optional glow on focus
            '&.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(59,130,246,0.15)',
            },
        },

        '& .MuiInputLabel-root': {
            color: '#64748b',
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#3b82f6',
        },
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
                p: 2
            }}
        >
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        width: '100%',
                        maxWidth: '440px',
                        borderRadius: 6,
                        bgcolor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <TerminalIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1.5 }} />
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: '#f8fafc',
                                letterSpacing: -1,
                                mb: 0.5
                            }}
                        >
                            Code-Break
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                            {isRegistering
                                ? 'Join the community of makers'
                                : 'Welcome back, developer'}
                        </Typography>
                    </Box>

                    {/* Error */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                color: '#fca5a5'
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleAuthentication}>
                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                sx={inputStyles}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={inputStyles}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                startIcon={isRegistering ? <PersonAddIcon /> : <LoginIcon />}
                                sx={{
                                    py: 1.8,
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
                                    '&:hover': {
                                        boxShadow: '0 12px 24px -4px rgba(37, 99, 235, 0.5)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading
                                    ? 'Checking logs...'
                                    : (isRegistering ? 'Initialize Account' : 'Authenticate')}
                            </Button>
                        </Stack>
                    </form>

                    {/* Toggle */}
                    <Box sx={{ mt: 3 }}>
                        <Button
                            onClick={() => setIsRegistering(!isRegistering)}
                            sx={{
                                color: '#3b82f6',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}
                        >
                            {isRegistering
                                ? 'Already have an account? Sign In'
                                : 'Need an account? Register Here'}
                        </Button>
                    </Box>

                    {/* Divider */}
                    <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.06)' }}>
                        <Typography
                            variant="caption"
                            sx={{ color: '#475569', fontWeight: 700, px: 1 }}
                        >
                            SYSTEM ACCESS
                        </Typography>
                    </Divider>

                    {/* Guest */}
                    <Button
                        fullWidth
                        variant="text"
                        onClick={handleGuestLogin}
                        sx={{
                            py: 1.2,
                            color: '#94a3b8',
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 500,
                            border: '1px solid rgba(255,255,255,0.05)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                color: '#f8fafc'
                            }
                        }}
                    >
                        Continue as Guest
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};