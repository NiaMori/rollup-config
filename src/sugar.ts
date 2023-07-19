import path from 'node:path'
import process from 'node:process'
import type { OutputOptions, Plugin, RollupOptions } from 'rollup'
import fg from 'fast-glob'
import createTypescriptPlugin from '@rollup/plugin-typescript'
import type { ObservableInput } from 'rxjs'
import { firstValueFrom, from, toArray } from 'rxjs'
import { define } from '@niamori/utils'
import { match } from 'ts-pattern'
import { createTypescriptDtsPostProcessorPlugin } from '@/plugins'

interface RollupConfigSugar {
  isDevMode: boolean
  isProdMode: boolean
  isWatchMode: boolean

  input: {
    tsEntries: (props?: { root?: string }) => Record<string, string>
  }

  output: {
    cjs: {
      bundle: (props?: { file?: string }) => OutputOptions
      dtsBundle: (props?: { file?: string }) => OutputOptions
    }

    esm: {
      bundless: (props?: { dir?: string }) => OutputOptions
    }
  }

  plugin: {
    ts (props?: {
      declaration: false
    } | {
      declaration?: true
      declarationMap?: boolean
      declarationDir?: string
    }): Plugin
  }
}

export async function configRollup(fn: (sugar: RollupConfigSugar) => ObservableInput<RollupOptions>): Promise<RollupOptions[]> {
  const isDevMode = process.env.ROLLUP_WATCH === 'true'
  const isProdMode = process.env.ROLLUP_WATCH !== 'true'
  const isWatchMode = process.env.ROLLUP_WATCH === 'true'

  const sugar = define<RollupConfigSugar>({
    isDevMode,
    isProdMode,
    isWatchMode,

    input: {
      tsEntries() {
        return Object.fromEntries(fg.sync(['**/!(*.d).ts'], { cwd: 'src', absolute: true }).map(file => [
          path.relative('src', file.slice(0, file.length - path.extname(file).length)),
          file,
        ]))
      },
    },

    output: {
      cjs: {
        bundle(props = {}) {
          const { file = 'dist/cjs/index.cjs' } = props

          return {
            file,
            format: 'cjs',
            sourcemap: isDevMode,
          }
        },

        dtsBundle(props = {}) {
          const { file = 'dist/cjs/index.d.cts' } = props

          return {
            file,
            format: 'cjs',
          }
        },
      },

      esm: {
        bundless(props = {}) {
          const { dir = 'dist/esm' } = props

          return {
            dir,
            format: 'esm',
            sourcemap: isDevMode,
            entryFileNames: '[name].js',
            plugins: [
              createTypescriptDtsPostProcessorPlugin({ declarationDir: dir }),
            ],
          }
        },
      },
    },

    plugin: {
      ts(props = {}) {
        return match(props)
          .with({ declaration: false }, () => {
            return createTypescriptPlugin({
              include: ['src/**/*.ts'],
              compilerOptions: {
                declaration: false,
              },
            })
          })
          .otherwise((props) => {
            const {
              declarationMap = isDevMode,
              declarationDir = 'dist/esm',
            } = props

            return createTypescriptPlugin({
              include: ['src/**/*.ts'],
              compilerOptions: {
                declaration: true,
                declarationMap,
                declarationDir,
              },
            })
          })
      },
    },
  })

  return await firstValueFrom(from(fn(sugar)).pipe(toArray()))
}
