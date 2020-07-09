import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'tunnel-demo',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    }
  ]
};
