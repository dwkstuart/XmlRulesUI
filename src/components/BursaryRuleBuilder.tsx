import React from 'react';
import { create } from 'xmlbuilder2';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  setRuleType,
  setComparator,
  setValue,
  setLogic,
  addRule,
  addGroup,
  removeBlock,
  setXml,
  setError,
  clearError,
  replaceRoot,
  RuleBlock
} from '../ruleBuilderSlice';
import { xmlTypesConst } from '../xmlTypes';
import XmlOutput from './XmlOutput';
import ErrorMessage from './ErrorMessage';
// Material UI imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

const GroupBlock: React.FC<{
  block: RuleBlock;
  path: number[];
  parent: RuleBlock | null;
}> = ({ block, path, parent }) => {
  const dispatch = useDispatch();
  const [inputError, setInputError] = React.useState<string>('');

  let inputType = 'text';
  let adornment: string | null = null;
  if (block.type === 'rule') {
    if (block.ruleType.value === 'age') inputType = 'number';
    if (block.ruleType.value === 'dob') inputType = 'date';
    if (block.ruleType.value === 'income') {
      inputType = 'number';
      adornment = '£';
    }
  }

  const validate = (val: string) => {
    if (block.type !== 'rule') return '';
    if (block.ruleType.value === 'age') {
      if (!/^\d+$/.test(val)) return 'Age must be a whole number';
      if (parseInt(val, 10) < 0) return 'Age must be positive';
    }
    if (block.ruleType.value === 'dob') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return 'Date must be YYYY-MM-DD';
      const d = new Date(val);
      if (isNaN(d.getTime())) return 'Invalid date';
    }
    if (block.ruleType.value === 'income') {
      if (!/^\d+(\.\d{1,2})?$/.test(val)) return 'Income must be a number';
      if (parseFloat(val) < 0) return 'Income must be positive';
    }
    return '';
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let error = '';
    if (block.ruleType.value === 'income' && val) {
      const num = Math.round(Number(val));
      val = isNaN(num) ? val : String(num);
    }
    error = validate(val);
    setInputError(error);
    dispatch(setValue({ path, value: val }));
  };

  if (block.type === 'rule') {
    return (
      <Paper elevation={2} sx={{ p: 2, m: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Select
          value={block.ruleType.value}
          onChange={e => dispatch(setRuleType({ path, typeValue: e.target.value }))}
          size="small"
          sx={{ minWidth: 140 }}
        >
          {xmlTypesConst.map(type => (
            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
          ))}
        </Select>
        <Select
          value={block.comparator?.value || ''}
          onChange={e => dispatch(setComparator({ path, compValue: e.target.value }))}
          size="small"
          sx={{ minWidth: 140 }}
        >
          {Array.isArray(block.ruleType?.comparators)
            ? (block.ruleType.comparators as { label: string; value: string }[]).map((comp) => (
                <MenuItem key={comp.value} value={comp.value}>{comp.label}</MenuItem>
              ))
            : null}
        </Select>
        <TextField
          type={inputType}
          value={block.value}
          onChange={handleValueChange}
          size="small"
          error={!!inputError}
          helperText={inputError}
          sx={{ minWidth: 120 }}
          InputProps={adornment ? { startAdornment: <InputAdornment position="start">{adornment}</InputAdornment> } : undefined}
        />
        {parent && (
          <Button onClick={() => dispatch(removeBlock({ path: path.slice(0, -1), idx: path[path.length - 1] }))} color="error" variant="outlined" size="small" sx={{ ml: 1 }}>
            Remove Rule
          </Button>
        )}
      </Paper>
    );
  }
  // group
  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="subtitle1">Match Logic:</Typography>
        <Select
          value={block.logic}
          onChange={e => dispatch(setLogic({ path, logic: e.target.value as 'AND' | 'OR' }))}
          size="small"
        >
          <MenuItem value="AND">ALL MATCH</MenuItem>
          <MenuItem value="OR">ONE MATCHES</MenuItem>
        </Select>
        {parent && (
          <Button onClick={() => dispatch(removeBlock({ path: path.slice(0, -1), idx: path[path.length - 1] }))} color="error" variant="outlined" size="small">
            Remove Group
          </Button>
        )}
      </Stack>
      <Box ml={2}>
        {block.children.map((child, i) => (
          <GroupBlock key={i} block={child} path={[...path, i]} parent={block} />
        ))}
      </Box>
      <Stack direction="row" spacing={2} mt={2}>
        <Button onClick={() => dispatch(addRule({ path, idx: block.children.length - 1 }))} variant="contained" size="small">
          Add Rule
        </Button>
        <Button onClick={() => dispatch(addGroup({ path, idx: block.children.length - 1 }))} variant="contained" size="small">
          Add Group
        </Button>
      </Stack>
    </Paper>
  );
};

interface BursaryRuleBuilderProps {
  onXmlChange?: (xml: string) => void;
  initialRules?: RuleBlock | null;
  onBuildXml?: (xml: string) => void;
}

const BursaryRuleBuilder: React.FC<BursaryRuleBuilderProps> = ({ onXmlChange, initialRules, onBuildXml }) => {
  const dispatch = useDispatch();
  const root = useSelector((state: RootState) => state.ruleBuilder.root);
  const xml = useSelector((state: RootState) => state.ruleBuilder.xml);
  const error = useSelector((state: RootState) => state.ruleBuilder.error);

  React.useEffect(() => {
    if (initialRules) {
      dispatch(replaceRoot(initialRules));
    } else {
      dispatch(replaceRoot(defaultGroup()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRules, dispatch]);
  React.useEffect(() => {
    if (onXmlChange) {
      onXmlChange(xml);
    }
  }, [xml, onXmlChange]);

  function hasEmptyValue(block: RuleBlock): boolean {
    if (block.type === 'rule') {
      if (block.value === undefined || block.value === null) return true;
      if (typeof block.value === 'string' && !block.value.trim()) return true;
      return false;
    }
    // If group has no children, it's empty
    if (!block.children || block.children.length === 0) return true;
    return block.children.some((child) => hasEmptyValue(child));
  }

  function hasAtLeastOneRule(block: RuleBlock): boolean {
    if (block.type === 'rule') return true;
    return block.children.some(child => hasAtLeastOneRule(child));
  }

  const buildXml = () => {
    if (!hasAtLeastOneRule(root)) {
      dispatch(setError('At least one rule is required before building XML.'));
      dispatch(setXml(''));
      if (onBuildXml) onBuildXml('');
      return;
    }
    if (hasEmptyValue(root)) {
      dispatch(setError('All rule values must be filled in before building XML.'));
      dispatch(setXml(''));
      if (onBuildXml) onBuildXml('');
      return;
    }
    dispatch(clearError());
    const doc = create({ version: '1.0' }).ele('rules');
    function buildXmlBlock(block: RuleBlock, doc: import('xmlbuilder2/lib/interfaces').XMLBuilder): void {
      if (block.type === 'rule') {
        // Use the ruleType value as the XML element name
        const ruleElem = doc.ele(block.ruleType.value);
        ruleElem.ele('comparator').txt(block.comparator.value).up();
        ruleElem.ele('value').txt(block.value).up();
        ruleElem.up();
      } else {
        const groupElem = doc.ele('group');
        groupElem.ele('logic').txt(block.logic).up();
        block.children.forEach((child) => buildXmlBlock(child, groupElem));
        groupElem.up();
      }
    }
    buildXmlBlock(root, doc);
    const xmlString = doc.end({ prettyPrint: true });
    dispatch(setXml(xmlString));
    if (onBuildXml) onBuildXml(xmlString);
  };

  return (
    <Box sx={{ fontFamily: 'sans-serif', textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" mb={3}>Bursary Rule Builder</Typography>
      <GroupBlock block={root} path={[]} parent={null} />
      <Box my={2}>
        <Button onClick={buildXml} variant="contained" color="primary" sx={{ mb: 2 }}>
          Build XML
        </Button>
      </Box>
      <ErrorMessage error={error} />
      <XmlOutput xml={xml} />
    </Box>
  );
};

export default BursaryRuleBuilder;
