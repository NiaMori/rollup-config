import createTsConfigPathsPluginCjsMod = require('rollup-plugin-tsconfig-paths')
import createTypescriptPluginCjsMod = require('@rollup/plugin-typescript')

export const createTsConfigPathsPlugin = createTsConfigPathsPluginCjsMod.default
export const createTypescriptPlugin = createTypescriptPluginCjsMod.default

export { default as createNodeExternalsPlugin } from 'rollup-plugin-node-externals'
export { default as createDtsPlugin } from 'rollup-plugin-dts'
