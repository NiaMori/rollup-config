import type { OutputOptions, Plugin, RollupOptions } from 'rollup'
import fg from 'fast-glob'
import { type ObservableInput } from 'rxjs/internal/types'
import { firstValueFrom, from, toArray } from 'rxjs'
import { define } from '@niamori/utils'
import { match } from 'ts-pattern'
import { createTypescriptPlugin } from '@niamori/rollup-config/plugins'

interface RollupConfigSugar {
  isDevMode: boolean
  isProdMode: boolean
  isWatchMode: boolean

  input: {
    tsEntries: (props?: { root?: string }) => Record<string, string>
  }

  output: {
    esm: {
      bundless: (props?: { dir?: string }) => OutputOptions
    }
    cjs: {
      bundless: (props?: { dir?: string }) => OutputOptions
    }
  }

  plugin: {
    ts(props?: {
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
        return Object.fromEntries(
          fg.sync(['src/**/!(*.d).{ts,tsx}'])
            .map(file => [file.replace(/\.tsx?$/, ''), file]),
        )
      },
    },

    output: {
      esm: {
        bundless(props = {}) {
          const { dir = 'dist/esm' } = props

          return {
            dir,
            format: 'esm',
            sourcemap: isDevMode,
          }
        },
      },

      cjs: {
        bundless(props = {}) {
          const { dir = 'dist/cjs' } = props

          return {
            dir,
            format: 'cjs',
            sourcemap: isDevMode,
          }
        },
      },
    },

    plugin: {
      ts(props = {}) {
        return match(props)
          .with({ declaration: false }, () => {
            return createTypescriptPlugin({
              include: ['src/**/*.ts', 'src/**/*.tsx'],
              compilerOptions: {
                declaration: false,
              },
              outputToFilesystem: true
            })
          })
          .narrow()
          .otherwise((props) => {
            const {
              declarationMap = isDevMode,
              declarationDir = 'dist/esm',
            } = props

            return createTypescriptPlugin({
              include: ['src/**/*.ts', 'src/**/*.tsx'],
              compilerOptions: {
                declaration: true,
                declarationMap,
                declarationDir,
              },
              outputToFilesystem: true
            })
          })
      },
    },
  })

  return await firstValueFrom(from(fn(sugar)).pipe(toArray()))
}
