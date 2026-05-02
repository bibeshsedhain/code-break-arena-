import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api';
import Editor from '@monaco-editor/react';

export const Workshop: React.FC = () => {
    const navigate = useNavigate();
    // 1. Grab the ID from the URL if it exists
    const { challengeId } = useParams<{ challengeId: string }>(); 
    
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(!!challengeId); // Loading state for editing

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('MD');
    const [starterCode, setStarterCode] = useState('def solution():\n    pass');
    const [solutionCode, setSolutionCode] = useState('def solution():\n    return True');
    
    const [testCases, setTestCases] = useState<any[]>([
        { input_data: 'print(solution())', expected_output: 'True', hidden_flag: false }
    ]);

    // 2. Fetch existing challenge data if we are in "Edit Mode"
    useEffect(() => {
        const fetchExistingChallenge = async () => {
            try {
                const response = await apiClient.get(`/challenges/${challengeId}/`);
                const data = response.data;
                
                // Pre-fill the form
                setTitle(data.title);
                setDescription(data.description);
                setDifficulty(data.difficulty);
                setStarterCode(data.starter_code);
                setSolutionCode(data.solution_code);
                
                // Pre-fill test cases (if any exist)
                if (data.test_cases && data.test_cases.length > 0) {
                    setTestCases(data.test_cases);
                }
            } catch (error) {
                console.error("Failed to load challenge data:", error);
                alert("Failed to load the challenge. It might not exist or you don't have permission.");
                navigate('/profile');
            } finally {
                setIsLoading(false);
            }
        };

        if (challengeId) {
            fetchExistingChallenge();
        }
    }, [challengeId, navigate]);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input_data: '', expected_output: '', hidden_flag: true }]);
    };

    const handleRemoveTestCase = (indexToRemove: number) => {
        setTestCases(testCases.filter((_, index) => index !== indexToRemove));
    };

    const handleTestCaseChange = (index: number, field: string, value: any) => {
        const newTestCases = [...testCases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublishing(true);

        const payload = {
            title,
            description,
            difficulty,
            starter_code: starterCode,
            solution_code: solutionCode,
            test_cases: testCases
        };

        try {
            // 3. Dynamic Submission Logic
            if (challengeId) {
                // Edit Mode -> PUT request
                await apiClient.put(`/challenges/${challengeId}/`, payload);
                alert("Challenge Updated Successfully!");
                navigate('/profile'); // Send them back to their portfolio
            } else {
                // Create Mode -> POST request
                await apiClient.post('/challenges/', payload);
                alert("Challenge Published Successfully!");
                navigate('/dashboard'); 
            }
        } catch (error: any) {
            console.error("Failed to publish:", error);
            if (error.response?.status === 403) alert("Permission Denied. You can only edit your own challenges.");
            else alert("Error saving challenge. Check the console.");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading Workshop...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Dynamic Title */}
                <h2>{challengeId ? '✏️ Edit Challenge' : '🛠️ The Maker Workshop'}</h2>
                <button onClick={() => navigate(challengeId ? '/profile' : '/dashboard')} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancel</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                
                {/* Basic Info */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <input 
                        required 
                        type="text" 
                        placeholder="Challenge Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ flex: 2, padding: '10px', fontSize: '16px' }}
                    />
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ flex: 1, padding: '10px' }}>
                        <option value="EZ">Easy (EZ)</option>
                        <option value="MD">Medium (MD)</option>
                        <option value="HD">Hard (HD)</option>
                    </select>
                </div>

                <textarea 
                    required 
                    placeholder="Describe the puzzle and instructions..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ padding: '10px', height: '100px', fontSize: '14px', resize: 'vertical' }}
                />

                {/* Code Editors */}
                <div style={{ display: 'flex', gap: '20px', height: '250px' }}>
                    <div style={{ flex: 1, border: '1px solid #ccc' }}>
                        <div style={{ backgroundColor: '#eee', padding: '5px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Starter Code</div>
                        <Editor language="python" theme="vs-dark" value={starterCode} onChange={(val) => setStarterCode(val || '')} options={{ minimap: { enabled: false } }} />
                    </div>
                    <div style={{ flex: 1, border: '1px solid #ccc' }}>
                        <div style={{ backgroundColor: '#eee', padding: '5px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Official Solution (Hidden)</div>
                        <Editor language="python" theme="vs-dark" value={solutionCode} onChange={(val) => setSolutionCode(val || '')} options={{ minimap: { enabled: false } }} />
                    </div>
                </div>

                {/* Test Cases Section */}
                <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Test Cases</h3>
                        <button type="button" onClick={handleAddTestCase} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Test Case</button>
                    </div>

                    {testCases.map((tc, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', width: '25px' }}>#{index + 1}</span>
                            <input 
                                required
                                type="text" 
                                placeholder="Input Data" 
                                value={tc.input_data} 
                                onChange={(e) => handleTestCaseChange(index, 'input_data', e.target.value)}
                                style={{ flex: 2, padding: '8px', fontFamily: 'monospace' }}
                            />
                            <input 
                                required
                                type="text" 
                                placeholder="Expected Output" 
                                value={tc.expected_output} 
                                onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                                style={{ flex: 1.5, padding: '8px', fontFamily: 'monospace' }}
                            />
                            <label style={{ flex: 0.5, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={tc.hidden_flag} 
                                    onChange={(e) => handleTestCaseChange(index, 'hidden_flag', e.target.checked)}
                                />
                                Hidden
                            </label>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveTestCase(index)}
                                style={{ padding: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    type="submit" 
                    disabled={isPublishing}
                    style={{ padding: '15px', fontSize: '18px', backgroundColor: isPublishing ? '#ccc' : (challengeId ? '#ffc107' : '#007bff'), color: challengeId ? 'black' : 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {isPublishing ? 'Saving...' : (challengeId ? '💾 Update Challenge' : '🚀 Publish Challenge')}
                </button>
            </form>
        </div>
    );
};