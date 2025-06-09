import { XMLParser } from 'fast-xml-parser';
import { xmlTypes } from '../xmlTypes';

type XmlGroup = {
  logic?: string | { '#text': string };
  rule?: XmlRule | XmlRule[];
  group?: XmlGroup | XmlGroup[];
};

type XmlRule = {
  name: string;
  comparator: string;
  value: string;
};

export function xmlToRules(xmlString: string) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const jsObj = parser.parse(xmlString);

  // Helper to recursively convert XML to your rule/group format
  function convertGroup(group: XmlGroup) {
    const logicRaw = typeof group.logic === 'object' ? group.logic['#text'] : group.logic || 'AND';
    const logic: 'AND' | 'OR' = logicRaw === 'OR' ? 'OR' : 'AND';
    let children: any[] = [];

    // Handle <rule> elements (old format)
    if (Array.isArray(group.rule)) {
      children = group.rule.map(convertRule);
    } else if (group.rule) {
      children = [convertRule(group.rule)];
    }

    // Handle direct rule-type elements (new format)
    for (const type of xmlTypes) {
      const ruleBlock = group[type.value];
      if (ruleBlock) {
        if (Array.isArray(ruleBlock)) {
          children = children.concat(ruleBlock.map(rb => convertRule({ ...rb, name: type.value })));
        } else {
          children.push(convertRule({ ...ruleBlock, name: type.value }));
        }
      }
    }

    if (Array.isArray(group.group)) {
      children = children.concat(group.group.map(convertGroup));
    } else if (group.group) {
      children.push(convertGroup(group.group));
    }

    return {
      type: 'group',
      logic,
      children,
    };
  }

  function convertRule(rule: XmlRule) {
    // Map ruleType and comparator to the correct objects from xmlTypes
    const ruleTypeObj = xmlTypes.find(t => t.value === rule.name) || xmlTypes[0];
    const comparatorObj = ruleTypeObj.comparators.find(c => c.value === rule.comparator) || ruleTypeObj.comparators[0];
    return {
      type: 'rule',
      ruleType: ruleTypeObj,
      comparator: comparatorObj,
      value: rule.value,
    };
  }

  // Your XML root might be <rules> or <group>
  const rootGroup = jsObj.rules?.group || jsObj.group;
  return convertGroup(rootGroup);
}