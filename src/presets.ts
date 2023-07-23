import * as fs from 'node:fs'

import { configRollup } from '@niamori/rollup-config/sugar'
import { createNodeExternalsPlugin } from '@niamori/rollup-config/plugins'

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
