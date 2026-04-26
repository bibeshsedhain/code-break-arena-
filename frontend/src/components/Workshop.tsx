import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Editor from '@monaco-editor/react';

export const Workshop: React.FC = () => {
    const navigate = useNavigate();
    const [isPublishing, setIsPublishing] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('MD'); // Default to Medium
    const [starterCode, setStarterCode] = useState('def solution():\n    pass');
    const [solutionCode, setSolutionCode] = useState('def solution():\n    return True');
    
    // Dynamic Test Cases Array
    const [testCases, setTestCases] = useState([
        { input_data: 'print(solution())', expected_output: 'True', hidden_flag: false }
    ]);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input_data: '', expected_output: '', hidden_flag: true }]);
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
            await apiClient.post('/challenges/', payload);
            alert("Challenge Published Successfully!");
            navigate('/dashboard'); // Kick them back to the lobby to see their creation
        } catch (error) {
            console.error("Failed to publish:", error);
            alert("Error publishing challenge. Check the console.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>🛠️ The Maker Workshop</h2>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancel</button>
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
                            <span style={{ fontWeight: 'bold' }}>#{index + 1}</span>
                            <input 
                                required
                                type="text" 
                                placeholder="Input Data (e.g. print(func([1,2])))" 
                                value={tc.input_data} 
                                onChange={(e) => handleTestCaseChange(index, 'input_data', e.target.value)}
                                style={{ flex: 2, padding: '8px', fontFamily: 'monospace' }}
                            />
                            <input 
                                required
                                type="text" 
                                placeholder="Expected Output (e.g. [1, 2])" 
                                value={tc.expected_output} 
                                onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                                style={{ flex: 1, padding: '8px', fontFamily: 'monospace' }}
                            />
                            <label style={{ flex: 0.5, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={tc.hidden_flag} 
                                    onChange={(e) => handleTestCaseChange(index, 'hidden_flag', e.target.checked)}
                                />
                                Hidden
                            </label>
                        </div>
                    ))}
                </div>

                <button 
                    type="submit" 
                    disabled={isPublishing}
                    style={{ padding: '15px', fontSize: '18px', backgroundColor: isPublishing ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {isPublishing ? 'Publishing to Database...' : '🚀 Publish Challenge'}
                </button>
            </form>
        </div>
    );
};