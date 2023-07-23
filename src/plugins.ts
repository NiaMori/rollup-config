/**
 * the esm exports of `@rollup/plugin-typescript` is [Masquerading as CJS](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md)
 * @see https://arethetypeswrong.github.io/?p=@rollup/plugin-typescript@11.1.2
 *
 * we have to use the cjs version util the issue is fixed
 * @see https://github.com/rollup/plugins/issues/1541
*/
import createTypescriptPluginCjsMod = require('@rollup/plugin-typescript')

export const createTypescriptPlugin = createTypescriptPluginCjsMod.default

export { default as createNodeExternalsPlugin } from 'rollup-plugin-node-externals'
