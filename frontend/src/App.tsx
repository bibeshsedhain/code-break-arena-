import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard'; // Import Dashboard
import { Arena } from './components/Arena';         // Import Arena

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* No padding wrapper here so the Arena can take up the full screen */}
                <Route path="/login" element={<div style={{ padding: '20px' }}><Login /></div>} />
                <Route path="/dashboard" element={<div style={{ padding: '20px' }}><Dashboard /></div>} />
                <Route path="/arena/:challengeId" element={<Arena />} />
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;