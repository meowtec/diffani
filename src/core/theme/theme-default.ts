import { type ThemeData } from './index';

/**
 * The Atom dark theme https://github.com/PrismJS/prism-themes/blob/master/themes/prism-atom-dark.css
 * It should be better to have an automated flow that convert prism theme to this format
 */
const defaultTheme: ThemeData = {
  fontFace:
    'ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace',
  color: '#c5c8c6',
  backgroundColor: '#000',
  tokenProperties: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#7C7C7C',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#c5c8c6',
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['property', 'keyword', 'tag'],
      style: {
        color: '#96CBFE',
      },
    },
    {
      types: ['class-name'],
      style: {
        color: '#FFFFB6',
      },
    },
    {
      types: ['boolean', 'constant'],
      style: {
        color: '#99CC99',
      },
    },
    {
      types: ['symbol', 'deleted'],
      style: {
        color: '#f92672',
      },
    },
    {
      types: ['number'],
      style: {
        color: '#FF73FD',
      },
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: {
        color: '#A8FF60',
      },
    },
    {
      types: ['variable'],
      style: {
        color: '#C6C5FE',
      },
    },
    {
      types: ['operator'],
      style: {
        color: '#EDEDED',
      },
    },
    {
      types: ['entity'],
      style: {
        color: '#FFFFB6',
      },
    },
    {
      types: ['url'],
      style: {
        color: '#96CBFE',
      },
    },
    {
      types: ['language-css', 'style'],
      style: {
        color: '#87C38A',
      },
    },
    {
      types: ['atrule', 'attr-value'],
      style: {
        color: '#F9EE98',
      },
    },
    {
      types: ['function'],
      style: {
        color: '#DAD085',
      },
    },
    {
      types: ['regex'],
      style: {
        color: '#E9C062',
      },
    },
    {
      types: ['important'],
      style: {
        color: '#fd971f',
      },
    },
    {
      types: ['bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
  ],
};

export default defaultTheme;
