import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'stencil-wormhole',
  taskQueue: 'async',
  enableCache: false,
  outputTargets: [
    {
      type: 'dist'
    },
    {
      type: 'docs-readme',
      strict: true
    }
  ]
};
