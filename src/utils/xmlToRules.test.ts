import { describe, it, expect } from 'vitest';
import { xmlToRules } from './xmlToRules';
import { xmlTypes } from '../xmlTypes';

const simpleXml = `<?xml version="1.0"?>
<rules>
  <group>
    <logic>AND</logic>
    <rule>
      <name>age</name>
      <comparator>equals</comparator>
      <value>30</value>
    </rule>
  </group>
</rules>`;

const nestedXml = `<?xml version="1.0"?>
<rules>
  <group>
    <logic>OR</logic>
    <rule>
      <name>income</name>
      <comparator>less_than</comparator>
      <value>20000</value>
    </rule>
    <group>
      <logic>AND</logic>
      <rule>
        <name>dob</name>
        <comparator>before</comparator>
        <value>2000-01-01</value>
      </rule>
    </group>
  </group>
</rules>`;

describe('xmlToRules', () => {
  it('parses a simple rule group', () => {
    const result = xmlToRules(simpleXml);
    expect(result).toEqual({
      type: 'group',
      logic: 'AND',
      children: [
        {
          type: 'rule',
          ruleType: xmlTypes[0],
          comparator: xmlTypes[0].comparators[0],
          value: 30,
        },
      ],
    });
  });

  it('parses nested groups and rules', () => {
    const result = xmlToRules(nestedXml);
    // Type narrowing for group
    if (result.type !== 'group') throw new Error('Expected root to be group');
    expect(result.logic).toBe('OR');
    expect(result.children.length).toBe(2);

    const rule = result.children[0];
    if (rule.type !== 'rule') throw new Error('Expected first child to be rule');
    expect(rule.ruleType.value).toBe('income');
    expect(rule.comparator.value).toBe('less_than');
    expect(rule.value).toBe(20000);

    const group = result.children[1];
    if (group.type !== 'group') throw new Error('Expected second child to be group');
    expect(group.logic).toBe('AND');
    expect(group.children.length).toBe(1);

    const nestedRule = group.children[0];
    if (nestedRule.type !== 'rule') throw new Error('Expected nested child to be rule');
    expect(nestedRule.ruleType.value).toBe('dob');
    expect(nestedRule.comparator.value).toBe('before');
    expect(nestedRule.value).toBe('2000-01-01');
  });

  it('defaults to first type/comparator if not found', () => {
    const xml = `<?xml version="1.0"?>\n<rules>\n  <group>\n    <logic>AND</logic>\n    <rule>\n      <name>not_a_type</name>\n      <comparator>not_a_comp</comparator>\n      <value>foo</value>\n    </rule>\n  </group>\n</rules>`;
    const result = xmlToRules(xml);
    expect(result).toEqual({
      type: 'group',
      logic: 'AND',
      children: [
        {
          type: 'rule',
          ruleType: xmlTypes[0],
          comparator: xmlTypes[0].comparators[0],
          value: 'foo',
        },
      ],
    });
  });
});
