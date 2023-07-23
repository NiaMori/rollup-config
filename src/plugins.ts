import createTypescriptPluginCjsMod = require('@rollup/plugin-typescript')

export const createTypescriptPlugin = createTypescriptPluginCjsMod.default

export { default as createNodeExternalsPlugin } from 'rollup-plugin-node-externals'
