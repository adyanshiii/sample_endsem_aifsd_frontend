import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [candForm, setCandForm] = useState({ name: '', email: '', skills: '', experience: '' });
  const [jobForm, setJobForm] = useState({ requiredSkills: '', minExperience: '' });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_URL}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...candForm,
        skills: candForm.skills.split(',').map(s => s.trim()),
        experience: Number(candForm.experience)
      };
      await axios.post(`${API_URL}/candidates`, payload);
      setCandForm({ name: '', email: '', skills: '', experience: '' });
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleLocalMatch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim()),
        minExperience: Number(jobForm.minExperience)
      };
      const res = await axios.post(`${API_URL}/match`, payload);
      setMatchResults(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleAiMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiResult('');
    try {
      const payload = {
        requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim()),
        minExperience: Number(jobForm.minExperience)
      };
      const res = await axios.post(`${API_URL}/ai/shortlist`, payload);
      setAiResult(res.data.aiRecommendation);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Candidate Shortlisting System</h1>

      <div className="card">
        <h2>Add Candidate</h2>
        <form onSubmit={handleAddCandidate}>
          <input placeholder="Name" value={candForm.name} onChange={e => setCandForm({ ...candForm, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={candForm.email} onChange={e => setCandForm({ ...candForm, email: e.target.value })} required />
          <input placeholder="Skills (comma separated)" value={candForm.skills} onChange={e => setCandForm({ ...candForm, skills: e.target.value })} required />
          <input placeholder="Experience (years)" type="number" value={candForm.experience} onChange={e => setCandForm({ ...candForm, experience: e.target.value })} required />
          <button type="submit">Add Candidate</button>
        </form>
      </div>

      <div className="card">
        <h2>Job Requirements</h2>
        <form>
          <input placeholder="Required Skills (comma separated)" value={jobForm.requiredSkills} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} required />
          <input placeholder="Minimum Experience" type="number" value={jobForm.minExperience} onChange={e => setJobForm({ ...jobForm, minExperience: e.target.value })} required />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ flex: 1 }} onClick={handleLocalMatch}>Basic Match</button>
            <button style={{ flex: 1, background: '#10b981' }} onClick={handleAiMatch} disabled={loading}>
              {loading ? 'Processing AI...' : 'AI Shortlist'}
            </button>
          </div>
        </form>
      </div>

      {matchResults.length > 0 && (
        <div className="card">
          <h2>Basic Match Rankings</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Skills</th>
                <th>Experience</th>
                <th>Match Score</th>
              </tr>
            </thead>
            <tbody>
              {matchResults.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.skills.join(', ')}</td>
                  <td>{c.experience} Yrs</td>
                  <td>{c.matchScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aiResult && (
        <div className="card">
          <h2>AI Smart Recommendation</h2>
          <pre>{aiResult}</pre>
        </div>
      )}

      <div className="card">
        <h2>All Registered Candidates</h2>
        <ul>
          {candidates.map(c => (
            <li key={c._id}>{c.name} - {c.skills.join(', ')} ({c.experience} Yrs)</li>
          ))}
        </ul>
      </div>
    </div>
  );
}