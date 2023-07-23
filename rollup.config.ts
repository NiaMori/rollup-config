import * as fs from 'node:fs'
import { bundleRequire } from 'bundle-require'
import { defineConfig } from 'rollup'
import { temporaryWrite } from 'tempy'
import { manipulate } from '@niamori/json-manipulator'

/*
  `bundle-require` implements an esbuild plugin as an opinionated way to externalize modules.
  the plugin marks self-referencing modules as external, which is not what we want.
  `bundle-require doesn't provide a way to mark a module as NOT external. (neither does esbuild)
  as a workaround, the plugin marks tsconfig path aliases as NOT external by default.
*/
const tempTsconfig = await temporaryWrite(
  manipulate['tsconfig.json'](await fs.promises.readFile('./tsconfig.json', 'utf-8'), (tsconfig) => {
    tsconfig.compilerOptions ||= {}
    tsconfig.compilerOptions.paths ||= {}
    tsconfig.compilerOptions.paths['@niamori/rollup-config/*'] = ['./src/*']
  }),

  { name: 'tsconfig.json' },
)

// we have an egg and chicken problem here.
// in order to use config presets to build itself, we need to build it first using bundle-require.
const { mod } = await bundleRequire({
  filepath: './src/presets.ts',
  format: 'esm',
  tsconfig: tempTsconfig,
  esbuildOptions: {
    conditions: ['dev:@niamori/rollup-config'],
    banner: {
      js: 'const require = await import("module").then(it => it.createRequire(import.meta.url));',
    },
  },
})

const { esm } = mod as typeof import('@niamori/rollup-config/presets')

export default defineConfig(async () => await esm())
