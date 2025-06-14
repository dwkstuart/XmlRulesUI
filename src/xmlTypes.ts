// xmlTypes.ts
// Contains the xmlTypes array and related export for use throughout the app
// This file is auto-generated from XSD. Do not edit manually.

export enum Color {
  Red = "Red",
  Green = "Green",
  Blue = "Blue"
}

export interface Item {
  Name: string;
  Color: Color;
}

export const xmlTypes = [
  {
    label: 'Color',
    value: 'color',
    comparators: [
      { label: 'Equals', value: 'equals' },
      { label: 'Not Equals', value: 'not_equals' }
    ],
    options: Object.values(Color).map(c => ({ label: c, value: c }))
  }
];

export const xmlTypesConst = xmlTypes;
