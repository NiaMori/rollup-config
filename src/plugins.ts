/**
 * the esm exports of `@rollup/plugin-typescript` is [Masquerading as CJS](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md)
 * @see https://arethetypeswrong.github.io/?p=@rollup/plugin-typescript@11.1.2
 *
 * we have to use the cjs version util the issue is fixed
 * @see https://github.com/rollup/plugins/issues/1541
*/
import typescriptPluginCjsMod = require('@rollup/plugin-typescript')

/**
 * same masquerading as cjs issue as `@rollup/plugin-typescript`
 * @see typescriptPluginCjsMod
 */
import replacePluginCjsMod = require('@rollup/plugin-replace')

import esbuildPluginCjsMod = require('rollup-plugin-esbuild')
import tsconfigPathsCjsMod = require('rollup-plugin-tsconfig-paths')
import runPluginCjsMod = require('@rollup/plugin-run')

export const createTypescriptPlugin = typescriptPluginCjsMod.default
export const createReplacePlugin = replacePluginCjsMod.default
export const createEsbuildPlugin = esbuildPluginCjsMod.default
export const createTsconfigPathsPlugin = tsconfigPathsCjsMod.default
export const createRunPlugin = runPluginCjsMod.default

export { default as createNodeExternalsPlugin } from 'rollup-plugin-node-externals'
