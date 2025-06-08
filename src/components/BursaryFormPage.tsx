import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { replaceRoot, defaultGroup } from '../ruleBuilderSlice';
import BursaryRuleBuilder from './BursaryRuleBuilder';
import { useNavigate } from 'react-router-dom';

const BursaryFormPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [awardName, setAwardName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [xmlString, setXmlString] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Handler to receive XML from BursaryRuleBuilder
  const handleXmlChange = (xml: string) => {
    setXmlString(xml);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitted(false);
    if (!awardName.trim() || !adminUser.trim() || !xmlString.trim()) {
      setFormError('All fields and rules are required.');
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/bursaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awardName, adminUser, xmlString })
      });
      if (!response.ok) {
        const err = await response.json();
        setFormError(err.error || 'Failed to save bursary.');
        return;
      }
      const result = await response.json();
      console.log('Saved bursary object, id:', result.id);
      setSubmitted(true);
    } catch {
      setFormError('Network or server error.');
    }
  };

  React.useEffect(() => {
    return () => {
      dispatch(replaceRoot(defaultGroup()));
    };
  }, [dispatch]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 3, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
      <Button onClick={() => {
        navigate('/');
        dispatch(replaceRoot(defaultGroup()));
      }} sx={{ mb: 2 }}>&larr; Back</Button>
      <Typography variant="h5" mb={2}>Create Bursary Award</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Bursary Name"
          value={awardName}
          onChange={e => setAwardName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Admin User"
          value={adminUser}
          onChange={e => setAdminUser(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Box sx={{ my: 3 }}>
          <BursaryRuleBuilder onXmlChange={handleXmlChange} />
        </Box>
        {formError && <Typography color="error" sx={{ mb: 2 }}>{formError}</Typography>}
        {submitted && <Typography color="success.main" sx={{ mb: 2 }}>Bursary saved! (see console for output)</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Save Bursary
        </Button>
      </form>
    </Box>
  );
};

export default BursaryFormPage;
