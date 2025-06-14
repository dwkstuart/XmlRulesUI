import React from 'react';
import { RuleBlock } from '../ruleBuilderSlice';

interface RuleRowProps {
  rule: RuleBlock;
  idx: number;
  isLast: boolean;
  logic: string;
  onTypeChange: (idx: number, typeValue: string) => void;
  onComparatorChange: (idx: number, compValue: string) => void;
  onValueChange: (idx: number, value: string) => void;
  onRemove: (idx: number) => void;
  disableRemove: boolean;
  xmlTypes: typeof import('../xmlTypes').xmlTypes;
}

const RuleRow: React.FC<RuleRowProps> = ({
  rule, idx, isLast, logic, onTypeChange, onComparatorChange, onValueChange, onRemove, disableRemove, xmlTypes
}) => {
  if (rule.type !== 'rule') return null;
  return (
    <div style={{ border: '1px solid #ccc', margin: 8, padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <label>
        Rule Name:
        <select value={rule.ruleType.value} onChange={e => onTypeChange(idx, e.target.value)} style={{ marginLeft: 8 }}>
          {xmlTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </label>
      <label>
        Comparator:
        <select value={rule.comparator.value} onChange={e => onComparatorChange(idx, e.target.value)} style={{ marginLeft: 8 }}>
          {rule.ruleType.comparators.map((comp: { label: string; value: string }) => (
            <option key={comp.value} value={comp.value}>{comp.label}</option>
          ))}
        </select>
      </label>
      <label>
        Value: <input type="text" value={rule.value} onChange={e => onValueChange(idx, e.target.value)} />
      </label>
      <button onClick={() => onRemove(idx)} disabled={disableRemove} style={{ marginLeft: 8 }}>Remove</button>
      {!isLast && (
        <span style={{ fontWeight: 'bold', margin: '0 8px' }}>{logic}</span>
      )}
    </div>
  );
};

export default RuleRow;
