import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import BursaryRuleBuilder from './BursaryRuleBuilder';
import { xmlToRules } from '../utils/xmlToRules'; // import the utility


interface EditBursaryPageProps {
  bursaryId: number;
  onBack: () => void;
}

const EditBursaryPage: React.FC<EditBursaryPageProps> = ({ bursaryId, onBack }) => {
  const [awardName, setAwardName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [xmlString, setXmlString] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialRules, setInitialRules] = useState<import('../ruleBuilderSlice').RuleBlock | null>(null);
  const [xmlBuilt, setXmlBuilt] = useState(false);


  // Fetch bursary by id
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/bursaries`)
      .then(res => res.json())
      .then((bursaries: Array<{ id: number; awardName: string; adminUser: string; xmlString: string }>) => {
        const bursary = bursaries.find((b) => b.id === bursaryId);
        if (bursary) {
          setAwardName(bursary.awardName);
          setAdminUser(bursary.adminUser);
          setXmlString(bursary.xmlString);
          setInitialRules(xmlToRules(bursary.xmlString));
        } else {
          setFormError('Bursary not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setFormError('Failed to load bursary');
        setLoading(false);
      });
  }, [bursaryId]);

  // Reset state when bursaryId or component unmounts
  useEffect(() => {
    setAwardName('');
    setAdminUser('');
    setXmlString('');
    setFormError('');
    setSubmitted(false);
    setLoading(true);
    setInitialRules(null);
    setXmlBuilt(false);
  }, [bursaryId]);

  // Reset xmlBuilt to false when rules change
  const handleXmlChange = (xml: string) => {
    setXmlString(xml);
    // Do not set xmlBuilt here
  };

  // Called when Build XML is pressed
  const handleBuildXml = (xml: string) => {
    setXmlString(xml);
    setXmlBuilt(true);
  };

  // Set xmlBuilt to false when user edits awardName or adminUser
  const handleAwardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAwardName(e.target.value);
    setXmlBuilt(false);
  };
  const handleAdminUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminUser(e.target.value);
    setXmlBuilt(false);
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
      const response = await fetch(`http://localhost:4000/bursaries/${bursaryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awardName, adminUser, xmlString })
      });
      if (!response.ok) {
        const err = await response.json();
        setFormError(err.error || 'Failed to update bursary.');
        return;
      }
      setSubmitted(true);
      setXmlBuilt(false); // Disable button after successful save
    } catch {
      setFormError('Network or server error.');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 3, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
      <Button onClick={onBack} sx={{ mb: 2 }}>&larr; Back</Button>
      <Typography variant="h5" mb={2}>Edit Bursary Award</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Bursary Name"
          value={awardName}
          onChange={handleAwardNameChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Admin User"
          value={adminUser}
          onChange={handleAdminUserChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Box sx={{ my: 3 }}>
          <BursaryRuleBuilder initialRules={initialRules} onXmlChange={handleXmlChange} onBuildXml={handleBuildXml} />
        </Box>
        {formError && <Typography color="error" sx={{ mb: 2 }}>{formError}</Typography>}
        {submitted && <Typography color="success.main" sx={{ mb: 2 }}>Bursary updated!</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={!xmlBuilt}>
          Save Changes
        </Button>
      </form>
    </Box>
  );
};

export default EditBursaryPage;
