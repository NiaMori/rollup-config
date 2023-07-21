import * as fs from 'node:fs'

import { configRollup } from '@niamori/rollup-config/sugar'
import {
  createDtsPlugin,
  createNodeExternalsPlugin,
} from '@niamori/rollup-config/plugins'

export async function esm() {
  await fs.promises.rm('dist', { recursive: true, force: true })

  return configRollup(async function *(sugar) {
    yield {
      input: sugar.input.tsEntries(),
      output: sugar.output.esm.bundless(),
      plugins: [
        createNodeExternalsPlugin(),
        sugar.plugin.ts(),
      ],
    }
  })
}

export async function cjs() {
  await fs.promises.rm('dist', { recursive: true, force: true })

  return configRollup(async function *(sugar) {
    yield {
      input: 'src/index.ts',
      output: sugar.output.cjs.bundle(),
      plugins: [
        createNodeExternalsPlugin(),
        sugar.plugin.ts({ declaration: false }),
      ],
    }

    yield {
      input: 'src/index.ts',
      output: sugar.output.cjs.dtsBundle(),
      plugins: [
        createDtsPlugin(),
      ],
    }
  })
}

export async function dual() {
  await fs.promises.rm('dist', { recursive: true, force: true })

  return configRollup(async function *(sugar) {
    yield * await esm()

    if (sugar.isProdMode) {
      yield * await cjs()
    }
  })
}
