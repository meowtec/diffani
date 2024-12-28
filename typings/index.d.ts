declare module '*.svg' {
  const content: string;
  export default content;
}

interface Window {
  hljs: typeof import('highlight.js').default;
}

declare module '*.module.scss';
