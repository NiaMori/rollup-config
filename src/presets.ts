import * as fs from 'node:fs'

import { configRollup } from '@niamori/rollup-config/sugar'
import {
  createEsbuildPlugin,
  createNodeExternalsPlugin,
  createReplacePlugin,
  createTsconfigPathsPlugin,
} from '@niamori/rollup-config/plugins'

export async function esmLib() {
  await fs.promises.rm('dist', { recursive: true, force: true })

  return configRollup(async function* (sugar) {
    yield {
      input: sugar.input.tsEntries(),
      output: sugar.output.esm.bundless(),
      plugins: [
        createNodeExternalsPlugin(),
        createReplacePlugin({
          values: {
            'import.meta.vitest': 'undefined',
          },

          // TODO: remove this option in next major version of `@rollup/plugin-replace`
          /**
           * in next major version of `@rollup/plugin-replace`, this option will be default to `true`
           * @see https://github.com/rollup/plugins/blob/5ec2abe0325ed6b23bca26a5455d2a3b137e9e29/packages/replace/src/index.js#L90
           */
          preventAssignment: true,
        }),
        sugar.plugin.ts(),
      ],
    }
  })
}

export async function cjsApp() {
  await fs.promises.rm('dist', { recursive: true, force: true })

  return configRollup(async function* (sugar) {
    yield {
      input: sugar.input.tsEntries(),
      output: sugar.output.cjs.bundless(),
      plugins: [
        createNodeExternalsPlugin(),
        createTsconfigPathsPlugin(),
        createEsbuildPlugin(),
      ],
    }
  })
}
