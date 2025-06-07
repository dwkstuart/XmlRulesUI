import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const xmlTypes = [
  {
    label: 'Age',
    value: 'age',
    comparators: [
      { label: 'Equals', value: 'equals' },
      { label: 'Less Than', value: 'less_than' },
      { label: 'Greater Than', value: 'greater_than' },
      { label: 'Between', value: 'between' }
    ]
  },
  {
    label: 'Date of Birth',
    value: 'dob',
    comparators: [
      { label: 'Before', value: 'before' },
      { label: 'After', value: 'after' },
      { label: 'On', value: 'on' },
      { label: 'Between', value: 'between' }
    ]
  },
  {
    label: 'Household Income',
    value: 'income',
    comparators: [
      { label: 'Less Than', value: 'less_than' },
      { label: 'Greater Than', value: 'greater_than' },
      { label: 'Equals', value: 'equals' },
      { label: 'Between', value: 'between' }
    ]
  },
  {
    label: 'Enrolment Status',
    value: 'enrolment_status',
    comparators: [
      { label: 'Equals', value: 'equals' },
      { label: 'Not Equals', value: 'not_equals' }
    ]
  }
];

export type RuleBlock =
  | {
      type: 'rule';
      ruleType: typeof xmlTypes[number];
      comparator: { label: string; value: string };
      value: string;
    }
  | {
      type: 'group';
      logic: 'AND' | 'OR';
      children: RuleBlock[];
    };

export interface RuleBuilderState {
  root: RuleBlock;
  xml: string;
  error: string;
}

const defaultRule = (): RuleBlock => ({
  type: 'rule',
  ruleType: xmlTypes[0],
  comparator: xmlTypes[0].comparators[0],
  value: ''
});
const defaultGroup = (): RuleBlock => ({
  type: 'group',
  logic: 'AND',
  children: [defaultRule()]
});

const initialState: RuleBuilderState = {
  root: defaultGroup(),
  xml: '',
  error: ''
};

function getBlockByPath(root: RuleBlock, path: number[]): RuleBlock {
  let node = root;
  for (const idx of path) {
    if (node.type === 'group') {
      node = node.children[idx];
    }
  }
  return node;
}

function updateBlockByPath(root: RuleBlock, path: number[], updater: (block: RuleBlock) => RuleBlock): RuleBlock {
  if (path.length === 0) return updater(root);
  if (root.type !== 'group') return root;
  const [head, ...rest] = path;
  return {
    ...root,
    children: root.children.map((child, idx) =>
      idx === head ? updateBlockByPath(child, rest, updater) : child
    )
  };
}

const ruleBuilderSlice = createSlice({
  name: 'ruleBuilder',
  initialState,
  reducers: {
    setRuleType(state, action: PayloadAction<{ path: number[]; typeValue: string }>) {
      state.root = updateBlockByPath(state.root, action.payload.path, block => {
        if (block.type !== 'rule') return block;
        const ruleType = xmlTypes.find(t => t.value === action.payload.typeValue)!;
        return {
          ...block,
          ruleType,
          comparator: ruleType.comparators[0],
          value: ''
        };
      });
    },
    setComparator(state, action: PayloadAction<{ path: number[]; compValue: string }>) {
      state.root = updateBlockByPath(state.root, action.payload.path, block => {
        if (block.type !== 'rule') return block;
        const ruleType = block.ruleType;
        return {
          ...block,
          comparator: ruleType.comparators.find(c => c.value === action.payload.compValue)!
        };
      });
    },
    setValue(state, action: PayloadAction<{ path: number[]; value: string }>) {
      state.root = updateBlockByPath(state.root, action.payload.path, block => {
        if (block.type !== 'rule') return block;
        return { ...block, value: action.payload.value };
      });
    },
    setLogic(state, action: PayloadAction<{ path: number[]; logic: 'AND' | 'OR' }>) {
      state.root = updateBlockByPath(state.root, action.payload.path, block => {
        if (block.type !== 'group') return block;
        return { ...block, logic: action.payload.logic };
      });
    },
    addRule(state, action: PayloadAction<{ path: number[]; idx: number }>) {
      state.root = updateBlockByPath(state.root, action.payload.path, block => {
        if (block.type !== 'group') return block;
        const children = [...block.children];
        children.splice(action.payload.idx + 1, 0, defaultRule());
        return { ...block, children };
      });
    },
    addGroup(state, action: PayloadAction<{ path: number[]; idx: number }>) {
      state.root = updateBlockByPath(state.root, action.payload.path, block => {
        if (block.type !== 'group') return block;
        const children = [...block.children];
        children.splice(action.payload.idx + 1, 0, defaultGroup());
        return { ...block, children };
      });
    },
    removeBlock(state, action: PayloadAction<{ path: number[]; idx: number }>) {
      state.root = updateBlockByPath(state.root, action.payload.path, block => {
        if (block.type !== 'group' || block.children.length <= 1) return block;
        const children = block.children.filter((_, i) => i !== action.payload.idx);
        return { ...block, children };
      });
    },
    setXml(state, action: PayloadAction<string>) {
      state.xml = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = '';
    },
    // Add this reducer for replacing the root block from XML or parsed rules
    replaceRoot(state, action: PayloadAction<any>) {
      state.root = action.payload;
    }
  }
});

export const xmlTypesConst = xmlTypes;
export const {
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
  replaceRoot
} = ruleBuilderSlice.actions;
export default ruleBuilderSlice.reducer;
