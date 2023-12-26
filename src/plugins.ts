import path from 'node:path'
import type { ChildProcess } from 'node:child_process'
import { fork } from 'node:child_process'
import type { Plugin } from 'rollup'

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
import tsconfigPathsPluginCjsMod = require('rollup-plugin-tsconfig-paths')

export const createTypescriptPlugin = typescriptPluginCjsMod.default
export const createReplacePlugin = replacePluginCjsMod.default
export const createEsbuildPlugin = esbuildPluginCjsMod.default
export const createTsconfigPathsPlugin = tsconfigPathsPluginCjsMod.default

export { default as createNodeExternalsPlugin } from 'rollup-plugin-node-externals'

export function createNiaMoriRunIndexPlugin(): Plugin {
  const childProcessRef = { current: null as null | ChildProcess }

  return {
    name: '@/plugin.run-index',

    writeBundle(outputOptions, bundle) {
      const distDir = outputOptions.dir || path.dirname(outputOptions.file!)

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if ('isEntry' in chunk && chunk.isEntry && chunk.facadeModuleId === path.resolve('src/index.ts')) {
          const entryFilePath = path.join(distDir, fileName)

          if (childProcessRef.current) {
            childProcessRef.current.kill()
          }

          childProcessRef.current = fork(entryFilePath)

          break
        }
      }
    },
  }
}
