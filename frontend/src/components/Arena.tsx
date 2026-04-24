import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import apiClient from '../api';

interface ExecutionResult {
    status: string;
    execution_time: number;
    results: any[];
}

export const Arena: React.FC = () => {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();
    
    // Core Arena State
    const [challenge, setChallenge] = useState<any>(null);
    const [code, setCode] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<ExecutionResult | null>(null);

    // Reveal Mechanic State
    const [failCount, setFailCount] = useState<number>(0);
    const [revealedSolution, setRevealedSolution] = useState<string | null>(null);
    const [revealError, setRevealError] = useState<string | null>(null);

    // 1. Fetch the specific challenge details when the component loads
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await apiClient.get(`/challenges/${challengeId}/`);
                setChallenge(response.data);
                if (response.data.starter_code) {
                    setCode(response.data.starter_code);
                }
            } catch (error) {
                console.error("Failed to fetch challenge details.");
            }
        };
        fetchChallenge();
    }, [challengeId]);

    // 2. Handle the Code Submission to your Django -> JDoodle pipeline
    const handleRunCode = async () => {
        setIsSubmitting(true);
        setFeedback(null);
        try {
            const response = await apiClient.post(`/challenges/${challengeId}/submit/`, { code });
            setFeedback(response.data);

            // Track failures for the Reveal Mechanic
            if (response.data.status === "FAIL" || response.data.status === "ERROR") {
                setFailCount(prev => prev + 1);
            } else if (response.data.status === "PASS") {
                setFailCount(0); // Reset counter if they pass
            }

        } catch (error: any) {
            console.error("Execution failed:", error);
            alert("Failed to reach the execution server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. Handle the Request for the Official Solution
    const handleRevealSolution = async () => {
        try {
            const response = await apiClient.get(`/challenges/${challengeId}/reveal/`);
            setRevealedSolution(response.data.solution_code);
            setRevealError(null);
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                setRevealError(`You need ${error.response.data.attempts_needed} more attempt(s) to unlock the solution.`);
            } else {
                setRevealError("Unable to fetch the solution.");
            }
        }
    };

    if (!challenge) return <div>Loading Arena Environment...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
            {/* Left Panel: Instructions & Results */}
            <div style={{ width: '40%', padding: '20px', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
                <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>&larr; Back to Dashboard</button>
                
                <h2>{challenge.title}</h2>
                <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                    {challenge.description}
                </div>

                <button 
                    onClick={handleRunCode} 
                    disabled={isSubmitting}
                    style={{ padding: '15px 30px', fontSize: '16px', backgroundColor: isSubmitting ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
                >
                    {isSubmitting ? 'Running...' : '▶ Run Code'}
                </button>

                {/* Dynamic Reveal Solution UI */}
                {failCount >= 3 && !revealedSolution && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                        <p style={{ margin: '0 0 10px 0' }}>You seem stuck. Would you like to view the official solution?</p>
                        <button 
                            onClick={handleRevealSolution}
                            style={{ padding: '10px 20px', backgroundColor: '#ffc107', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
                        >
                            Reveal Solution
                        </button>
                        {revealError && <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{revealError}</p>}
                    </div>
                )}

                {/* Display the Solution Once Fetched */}
                {revealedSolution && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e2e3e5', borderRadius: '5px' }}>
                        <h4 style={{ marginTop: 0 }}>Official Solution:</h4>
                        <pre style={{ backgroundColor: '#212529', color: '#f8f9fa', padding: '15px', borderRadius: '5px', overflowX: 'auto', fontSize: '14px' }}>
                            {revealedSolution}
                        </pre>
                        <button 
                            onClick={() => setCode(revealedSolution)}
                            style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                        >
                            Copy to Editor
                        </button>
                    </div>
                )}

                {/* Feedback Display */}
                {feedback && (
                    <div style={{ marginTop: '30px', padding: '15px', borderRadius: '5px', backgroundColor: feedback.status === 'PASS' ? '#d4edda' : '#f8d7da' }}>
                        <h3 style={{ color: feedback.status === 'PASS' ? '#155724' : '#721c24', marginTop: 0 }}>
                            Result: {feedback.status}
                        </h3>
                        <p style={{ margin: '5px 0' }}>Execution Time: {feedback.execution_time}s</p>
                        <h4 style={{ marginBottom: '10px' }}>Test Case Breakdown:</h4>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                            {feedback.results.map((test, index) => (
                                <li key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                                    <strong>Test {index + 1}:</strong> {test.passed ? '✅ Passed' : '❌ Failed'}
                                    <br/>
                                    <small style={{ fontFamily: 'monospace', display: 'block', marginTop: '5px' }}>
                                        Output: {test.stdout || 'No output'}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right Panel: Monaco Editor */}
            <div style={{ width: '60%' }}>
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                    }}
                />
            </div>
        </div>
    );
};