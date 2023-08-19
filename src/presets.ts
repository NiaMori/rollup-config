import * as fs from 'node:fs'

import { configRollup } from '@niamori/rollup-config/sugar'
import {
  createEsbuildPlugin,
  createNodeExternalsPlugin,
  createReplacePlugin,
  createRunPlugin,
  createTsconfigPathsPlugin,
} from '@niamori/rollup-config/plugins'
import { readTSConfig } from 'pkg-types'

export async function esmLib() {
  await fs.promises.rm('dist', { recursive: true, force: true })

  const tsconfig = await readTSConfig()

  if (tsconfig?.compilerOptions?.module.toLowerCase() !== 'nodenext') {
    throw new Error(
      'The `compilerOptions.module` of tsconfig.json must be "NodeNext" for esmLib',
    )
  }

  if (tsconfig?.compilerOptions?.moduleResolution.toLowerCase() !== 'nodenext') {
    throw new Error(
      'The `compilerOptions.moduleResolution` of tsconfig.json must be "NodeNext" for esmLib',
    )
  }

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

export async function cjsApp(props: { autoRun?: boolean } = {}) {
  await fs.promises.rm('dist', { recursive: true, force: true })

  const { autoRun = true } = props

  const tsconfig = await readTSConfig()

  if (tsconfig?.compilerOptions?.module.toLowerCase() !== 'commonjs') {
    throw new Error(
      'The `compilerOptions.module` of tsconfig.json must be "CommonJs" for cjsApp',
    )
  }

  if (tsconfig?.compilerOptions?.moduleResolution.toLowerCase() !== 'node') {
    throw new Error(
      'The `compilerOptions.moduleResolution` of tsconfig.json must be "Node" for cjsApp',
    )
  }

  return configRollup(async function* (sugar) {
    yield {
      input: sugar.input.tsEntries(),
      output: sugar.output.cjs.bundless(),
      plugins: [
        createNodeExternalsPlugin(),
        createTsconfigPathsPlugin(),
        createEsbuildPlugin(),
        autoRun && sugar.isDevMode && createRunPlugin(),
      ],
    }
  })
}
