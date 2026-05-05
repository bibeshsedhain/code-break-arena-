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
    CircularProgress,
    Card,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';

import apiClient from '../api';

const difficulties = [
    { value: 'EZ', label: '🟢 Easy' },
    { value: 'MD', label: '🟡 Medium' },
    { value: 'HD', label: '🔴 Hard' },
];

// Reusable custom styling for Dark Glass-morphic Inputs
const glassTextFieldSx = {
    '& .MuiOutlinedInput-root': {
        color: '#f8fafc',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
    },
    '& .MuiInputLabel-root': { color: '#94a3b8' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
};

// Reusable styling for Glass-morphic Cards
const glassPaperSx = {
    p: 4, 
    borderRadius: 4, 
    background: 'rgba(30, 41, 59, 0.5)', 
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
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
        { input_data: 'print(solution())', expected_output: 'True', hidden_flag: true }
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
                
                if (data.test_cases?.length > 0) {
                    const forcedHiddenCases = data.test_cases.map((tc: any) => ({
                        ...tc,
                        hidden_flag: true
                    }));
                    setTestCases(forcedHiddenCases);
                }
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#020617' }}>
                <CircularProgress sx={{ color: '#3b82f6' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #020617 100%)', 
            py: 6,
            color: '#e2e8f0'
        }}>
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate(challengeId ? '/profile' : '/dashboard')}
                        sx={{ textTransform: 'none', color: '#94a3b8', fontWeight: 600, '&:hover': { color: '#fff' } }}
                    >
                        Discard
                    </Button>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
                            {challengeId ? 'Edit Challenge' : 'Maker Workshop'}
                        </Typography>
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        {/* PHASE 1: METADATA */}
                        <Paper sx={glassPaperSx} elevation={0}>
                            <Typography variant="overline" sx={{ color: '#60a5fa', fontWeight: 800, letterSpacing: '1px' }}>
                                Phase 1: Metadata
                            </Typography>
                            <Stack spacing={3} sx={{ mt: 2 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Challenge Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        sx={glassTextFieldSx}
                                    />
                                    <TextField
                                        select
                                        label="Difficulty"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        sx={{ ...glassTextFieldSx, minWidth: 160 }}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    sx: { bgcolor: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                                                }
                                            }
                                        }}
                                    >
                                        {difficulties.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
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
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    sx={glassTextFieldSx}
                                />
                            </Stack>
                        </Paper>

                        {/* PHASE 2: LOGIC DESIGN */}
                        <Box>
                            <Typography variant="overline" sx={{ color: '#60a5fa', fontWeight: 800, ml: 1, letterSpacing: '1px' }}>
                                Phase 2: Logic Design
                            </Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 1 }}>
                                <Card sx={{ flex: 1, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', bgcolor: '#0f172a', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}>
                                    <Box sx={{ px: 2, py: 1.5, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>STARTER_CODE.PY</Typography>
                                    </Box>
                                    <Box sx={{ height: 300 }}>
                                        <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={starterCode} onChange={(v) => setStarterCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} />
                                    </Box>
                                </Card>
                                <Card sx={{ flex: 1, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', bgcolor: '#0f172a', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}>
                                    <Box sx={{ px: 2, py: 1.5, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#34d399', letterSpacing: '1px' }}>HIDDEN_SOLUTION.PY</Typography>
                                    </Box>
                                    <Box sx={{ height: 300 }}>
                                        <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={solutionCode} onChange={(v) => setSolutionCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} />
                                    </Box>
                                </Card>
                            </Stack>
                        </Box>

                        {/* PHASE 3: TEST SUITE */}
                        <Paper sx={glassPaperSx} elevation={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>Test Suite</Typography>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    startIcon={<AddIcon />} 
                                    onClick={handleAddTestCase}
                                    sx={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.5)', '&:hover': { borderColor: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' } }}
                                >
                                    New Case
                                </Button>
                            </Box>
                            <Stack spacing={2}>
                                {testCases.map((tc, index) => (
                                    <Box key={index} sx={{ 
                                        p: 3, 
                                        background: 'rgba(15, 23, 42, 0.6)', 
                                        borderRadius: 3, 
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'all 0.2s',
                                        '&:hover': { border: '1px solid rgba(255, 255, 255, 0.15)' }
                                    }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                            <TextField
                                                required
                                                fullWidth
                                                label={`Input #${index + 1}`}
                                                value={tc.input_data}
                                                onChange={(e) => handleTestCaseChange(index, 'input_data', e.target.value)}
                                                sx={glassTextFieldSx}
                                                slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: 14 } } }}
                                            />
                                            <TextField
                                                required
                                                fullWidth
                                                label="Expected Output"
                                                value={tc.expected_output}
                                                onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                                                sx={glassTextFieldSx}
                                                slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: 14 } } }}
                                            />
                                            <IconButton 
                                                onClick={() => handleRemoveTestCase(index)} 
                                                sx={{ alignSelf: 'center', color: '#ef4444', opacity: 0.7, '&:hover': { opacity: 1, background: 'rgba(239, 68, 68, 0.1)' } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                        
                                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                                            <LockIcon sx={{ fontSize: 14, mr: 0.75 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                                                Test case permanently hidden from players
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>

                        {/* SUBMIT BUTTON */}
                        <Button
                            type="submit"
                            disabled={isPublishing}
                            variant="contained"
                            fullWidth
                            startIcon={challengeId ? <SaveIcon /> : <RocketLaunchIcon />}
                            sx={{
                                py: 2,
                                borderRadius: 4,
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                letterSpacing: '0.5px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                    boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.39)'
                                }
                            }}
                        >
                            {isPublishing ? 'Transmitting...' : (challengeId ? 'Update Challenge' : 'Launch Challenge')}
                        </Button>
                    </Stack>
                </form>
            </Container>
        </Box>
    );
};