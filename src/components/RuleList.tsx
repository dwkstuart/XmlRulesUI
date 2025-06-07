import React from 'react';
import { Rule } from '../ruleBuilderSlice';
import RuleRow from './RuleRow';

interface RuleListProps {
  rules: Rule[];
  logic: string;
  onTypeChange: (idx: number, typeValue: string) => void;
  onComparatorChange: (idx: number, compValue: string) => void;
  onValueChange: (idx: number, value: string) => void;
  onRemove: (idx: number) => void;
  onAdd: () => void;
  xmlTypes: typeof import('../ruleBuilderSlice').xmlTypesConst;
}

const RuleList: React.FC<RuleListProps> = ({
  rules, logic, onTypeChange, onComparatorChange, onValueChange, onRemove, onAdd, xmlTypes
}) => (
  <>
    {rules.map((rule, idx) => (
      <RuleRow
        key={idx}
        rule={rule}
        idx={idx}
        isLast={idx === rules.length - 1}
        logic={logic}
        onTypeChange={onTypeChange}
        onComparatorChange={onComparatorChange}
        onValueChange={onValueChange}
        onRemove={onRemove}
        xmlTypes={xmlTypes}
        disableRemove={rules.length === 1}
      />
    ))}
    <button onClick={onAdd} style={{ margin: '16px 0' }}>Add Rule</button>
  </>
);

export default RuleList;
