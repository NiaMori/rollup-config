import { configRollup } from '@niamori/rollup-config/sugar'
import {
  createEsbuildPlugin,
  createNiaMoriRunIndexPlugin,
  createNodeExternalsPlugin,
  createReplacePlugin,
  createTsconfigPathsPlugin,
} from '@niamori/rollup-config/plugins'

export async function esmLib(props: { autoRun?: boolean, declaration?: boolean } = {}) {
  const { autoRun = true, declaration = true } = props

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
        sugar.plugin.ts({ declaration }),
        autoRun && sugar.isDevMode && createNiaMoriRunIndexPlugin(),
      ],
    }
  })
}

export async function cjsApp(props: { autoRun?: boolean } = {}) {
  const { autoRun = true } = props

  return configRollup(async function* (sugar) {
    yield {
      input: sugar.input.tsEntries(),
      output: sugar.output.cjs.bundless(),
      plugins: [
        createNodeExternalsPlugin(),
        createTsconfigPathsPlugin(),
        createEsbuildPlugin(),
        autoRun && sugar.isDevMode && createNiaMoriRunIndexPlugin(),
      ],
    }
  })
}
