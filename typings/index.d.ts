declare module '*.svg' {
  const content: string;
  export default content;
}

interface Window {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  hljs: typeof import('highlight.js').default;
}

declare module '*.module.scss';
