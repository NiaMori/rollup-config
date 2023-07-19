import type { Plugin } from 'rollup'
import { replaceTscAliasPaths } from 'tsc-alias'

export { default as createNodeExternalsPlugin } from 'rollup-plugin-node-externals'
export { default as createTsConfigPathsPlugin } from 'rollup-plugin-tsconfig-paths'
export { default as createDtsPlugin } from 'rollup-plugin-dts'
export { default as createTypescriptPlugin } from '@rollup/plugin-typescript'

export function createTypescriptDtsPostProcessorPlugin(props: { declarationDir: string }): Plugin {
  const { declarationDir } = props

  return {
    name: '@niamori/rollup-config:typescript-dts-post-processor',
    writeBundle: async () => {
      await replaceTscAliasPaths({ outDir: declarationDir })
    },
  }
}
