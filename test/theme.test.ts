import { describe, expect, it } from 'vitest';
import { Theme } from '../src/core/theme/index.js';

describe('theme', () => {
  it('get style of types', () => {
    const theme = new Theme({
      fontFace: 'monaco',
      color: '#333',
      backgroundColor: '#444',
      tokenProperties: [
        {
          types: ['boolean', 'constant'],
          style: {
            color: '#99CC99',
          },
        },
        {
          types: ['symbol'],
          style: {
            fontStyle: 'italic',
            color: '#f92672',
          },
        },
        {
          types: ['deleted'],
          style: {
            color: '#FF73FD',
          },
        },
        {
          types: ['boolean'],
          style: {
            fontWeight: 'bold',
          },
        },
      ],
    });

    expect(theme.getTypesStyle(['boolean'])).toEqual({
      color: '#99CC99',
      fontWeight: 'bold',
    });

    expect(theme.getTypesStyle(['symbol', 'deleted'])).toEqual({
      color: '#FF73FD',
      fontStyle: 'italic',
    });
  });
});
