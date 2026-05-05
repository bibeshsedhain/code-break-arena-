import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Box,
    Button,
    Container,
    Typography,
    TextField,
    MenuItem,
    Paper,
    Stack,
    IconButton,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Card,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';

import apiClient from '../api';

const difficulties = [
    { value: 'EZ', label: '🟢 Easy' },
    { value: 'MD', label: '🟡 Medium' },
    { value: 'HD', label: '🔴 Hard' },
];

// Shared dark mode input styles for consistency
const darkInputStyles = {
    '& .MuiOutlinedInput-root': {
        color: '#f8fafc',
        borderRadius: '12px',
        backgroundColor: 'rgba(2, 6, 23, 0.4)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
        '& input::placeholder': { color: '#64748b', opacity: 1 },
        '& textarea::placeholder': { color: '#64748b', opacity: 1 },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
    '& .MuiSvgIcon-root': { color: '#94a3b8' }, // Dropdown arrows
};

export const Workshop: React.FC = () => {
    const navigate = useNavigate();
    const { challengeId } = useParams<{ challengeId: string }>();

    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(!!challengeId);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('MD');
    const [starterCode, setStarterCode] = useState('def solution():\n    pass');
    const [solutionCode, setSolutionCode] = useState('def solution():\n    return True');
    const [testCases, setTestCases] = useState<any[]>([
        { input_data: 'print(solution())', expected_output: 'True', hidden_flag: false }
    ]);

    useEffect(() => {
        const fetchExistingChallenge = async () => {
            try {
                const response = await apiClient.get(`/challenges/${challengeId}/`);
                const data = response.data;
                setTitle(data.title);
                setDescription(data.description);
                setDifficulty(data.difficulty);
                setStarterCode(data.starter_code);
                setSolutionCode(data.solution_code);
                if (data.test_cases?.length > 0) setTestCases(data.test_cases);
            } catch (error) {
                console.error("Failed to load challenge data:", error);
                navigate('/profile');
            } finally {
                setIsLoading(false);
            }
        };

        if (challengeId) fetchExistingChallenge();
    }, [challengeId, navigate]);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input_data: '', expected_output: '', hidden_flag: true }]);
    };

    const handleRemoveTestCase = (index: number) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleTestCaseChange = (index: number, field: string, value: any) => {
        const newTestCases = [...testCases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublishing(true);

        const payload = { title, description, difficulty, starter_code: starterCode, solution_code: solutionCode, test_cases: testCases };

        try {
            if (challengeId) {
                await apiClient.put(`/challenges/${challengeId}/`, payload);
                navigate('/profile');
            } else {
                await apiClient.post('/challenges/', payload);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Failed to publish:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                minHeight: '100vh', '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
                background: '#020617', backgroundImage: 'radial-gradient(circle at top center, #1e293b 0%, #020617 120%)'
            }}>
                <CircularProgress sx={{ color: '#3b82f6' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
            background: '#020617', 
            backgroundImage: 'radial-gradient(circle at top center, #1e293b 0%, #020617 120%)',
            py: { xs: 3, sm: 6 } 
        }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, sm: 4 } }}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate(challengeId ? '/profile' : '/dashboard')}
                        sx={{ 
                            textTransform: 'none', 
                            color: '#94a3b8', 
                            fontWeight: 600,
                            '&:hover': { color: '#f8fafc', background: 'rgba(255,255,255,0.05)' }
                        }}
                    >
                        Discard
                    </Button>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: -0.5, fontSize: { xs: '1.25rem', sm: '1.75rem' } }}>
                            {challengeId ? 'Edit Challenge' : 'Maker Workshop'}
                        </Typography>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        {/* Phase 1: Metadata */}
                        <Paper sx={{ 
                            p: { xs: 3, sm: 4 }, 
                            borderRadius: { xs: 4, sm: 5 }, 
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }} elevation={0}>
                            <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 800, letterSpacing: 1 }}>Phase 1: Metadata</Typography>
                            <Stack spacing={3} sx={{ mt: 2 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Challenge Title"
                                        placeholder="e.g. Reverse Binary Tree"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        sx={darkInputStyles}
                                    />
                                    <TextField
                                        select
                                        label="Difficulty"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        sx={{ minWidth: { xs: '100%', sm: 160 }, ...darkInputStyles }}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    sx: { bgcolor: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' }
                                                }
                                            }
                                        }}
                                    >
                                        {difficulties.map((option) => (
                                            <MenuItem key={option.value} value={option.value} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }}}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                                <TextField
                                    required
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Problem Description"
                                    placeholder="Explain the objective, inputs, and expected outputs..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    sx={darkInputStyles}
                                />
                            </Stack>
                        </Paper>

                        {/* Phase 2: Logic Design */}
                        <Box>
                            <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 800, ml: 1, letterSpacing: 1 }}>Phase 2: Logic Design</Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1 }}>
                                <Card sx={{ 
                                    flex: 1, 
                                    borderRadius: 4, 
                                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                                    overflow: 'hidden', 
                                    bgcolor: '#0f172a',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                }}>
                                    <Box sx={{ px: 2, py: 1.5, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: 0.5 }}>STARTER_CODE.PY</Typography>
                                    </Box>
                                    <Box sx={{ height: { xs: 200, sm: 280 } }}>
                                        <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={starterCode} onChange={(v) => setStarterCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }} />
                                    </Box>
                                </Card>
                                <Card sx={{ 
                                    flex: 1, 
                                    borderRadius: 4, 
                                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                                    overflow: 'hidden', 
                                    bgcolor: '#0f172a',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                }}>
                                    <Box sx={{ px: 2, py: 1.5, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#34d399', letterSpacing: 0.5 }}>HIDDEN_SOLUTION.PY</Typography>
                                    </Box>
                                    <Box sx={{ height: { xs: 200, sm: 280 } }}>
                                        <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={solutionCode} onChange={(v) => setSolutionCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 16 } }} />
                                    </Box>
                                </Card>
                            </Stack>
                        </Box>

                        {/* Test Suite */}
                        <Paper sx={{ 
                            p: { xs: 3, sm: 4 }, 
                            borderRadius: { xs: 4, sm: 5 }, 
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                        }} elevation={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>Test Suite</Typography>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    startIcon={<AddIcon />} 
                                    onClick={handleAddTestCase}
                                    sx={{ 
                                        color: '#f8fafc', 
                                        borderColor: 'rgba(255,255,255,0.2)', 
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        '&:hover': { borderColor: '#f8fafc', background: 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    New Case
                                </Button>
                            </Box>
                            <Stack spacing={2}>
                                {testCases.map((tc, index) => (
                                    <Box key={index} sx={{ 
                                        p: { xs: 2, sm: 3 }, 
                                        background: 'rgba(2, 6, 23, 0.3)', 
                                        borderRadius: 4, 
                                        border: '1px solid rgba(255,255,255,0.05)' 
                                    }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                            <TextField
                                                required
                                                fullWidth
                                                label={`Input #${index + 1}`}
                                                value={tc.input_data}
                                                onChange={(e) => handleTestCaseChange(index, 'input_data', e.target.value)}
                                                sx={{ 
                                                    ...darkInputStyles, 
                                                    '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 14 } 
                                                }}
                                            />
                                            <TextField
                                                required
                                                fullWidth
                                                label="Expected Output"
                                                value={tc.expected_output}
                                                onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                                                sx={{ 
                                                    ...darkInputStyles, 
                                                    '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 14 } 
                                                }}
                                            />
                                            <IconButton 
                                                onClick={() => handleRemoveTestCase(index)} 
                                                sx={{ 
                                                    alignSelf: { xs: 'flex-end', sm: 'center' },
                                                    color: '#ef4444',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    borderRadius: 2,
                                                    '&:hover': { background: 'rgba(239, 68, 68, 0.2)' }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                        <FormControlLabel
                                            sx={{ mt: 1.5, ml: 0, color: '#94a3b8' }}
                                            control={<Checkbox size="small" checked={tc.hidden_flag} onChange={(e) => handleTestCaseChange(index, 'hidden_flag', e.target.checked)} sx={{ color: '#64748b', '&.Mui-checked': { color: '#3b82f6' } }} />}
                                            label={<Typography variant="caption" sx={{ fontWeight: 500 }}>Hidden case (Players won't see expected output)</Typography>}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isPublishing}
                            variant="contained"
                            fullWidth
                            startIcon={challengeId ? <SaveIcon /> : <RocketLaunchIcon />}
                            sx={{
                                py: { xs: 1.8, sm: 2 },
                                borderRadius: 4,
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                textTransform: 'none',
                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 12px 24px -4px rgba(37, 99, 235, 0.5)',
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s',
                                '&.Mui-disabled': {
                                    background: 'rgba(255,255,255,0.1)',
                                    color: '#64748b'
                                }
                            }}
                        >
                            {isPublishing ? 'Transmitting Data...' : (challengeId ? 'Update Sequence' : 'Launch Sequence')}
                        </Button>
                    </Stack>
                </form>
            </Container>
        </Box>
    );
};