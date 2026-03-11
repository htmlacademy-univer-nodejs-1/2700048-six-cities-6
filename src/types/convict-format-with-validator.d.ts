declare module 'convict-format-with-validator' {
  import type convict from 'convict';

  const formats: { [name: string]: convict.Format };

  export default formats;
}

