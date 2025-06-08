// xmlTypes.ts
// Contains the xmlTypes array and related export for use throughout the app

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

export const xmlTypesConst = xmlTypes;
