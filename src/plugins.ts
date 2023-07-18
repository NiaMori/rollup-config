import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'rollup'
import fg from 'fast-glob'
import { replaceTscAliasPaths } from 'tsc-alias'

export { default as createNodeExternalsPlugin } from 'rollup-plugin-node-externals'
export { default as createTsConfigPathsPlugin } from 'rollup-plugin-tsconfig-paths'
export { default as createDtsPlugin } from 'rollup-plugin-dts'
export { default as createTypescriptPlugin } from '@rollup/plugin-typescript'

export function createTypescriptDtsPostProcessorPlugin(props: { declarationDir: string }): Plugin {
  const { declarationDir } = props

  return {
    name: '@niamori/rollup-config:typescript-dts-post-processor',
    writeBundle: async () => {
      for (const dts of await fg('**/*.d.ts', { cwd: declarationDir })) {
        const dmts = dts.replace(/.d.ts$/, '.d.mts')

        const dtsPath = path.resolve(declarationDir, dts)
        const dmtsPath = path.resolve(declarationDir, dmts)

        await fs.promises.rename(dtsPath, dmtsPath)

        const dtsMap = dts.replace(/.d.ts$/, '.d.ts.map')
        const dtsMapPath = path.resolve(declarationDir, dtsMap)

        if (await fs.promises.access(dtsMapPath).then(() => true).catch(() => false)) {
          const dmtsMap = dts.replace(/.d.ts$/, '.d.mts.map')
          const dmtsMapPath = path.resolve(declarationDir, dmtsMap)

          await fs.promises.rename(dtsMapPath, dmtsMapPath)

          const dmtsSource = await fs.promises.readFile(dmtsPath, 'utf-8')
          const dmtsSourceLastLine = dmtsSource.split('\n').pop()

          if (dmtsSourceLastLine && dmtsSourceLastLine.startsWith('//# sourceMappingURL=')) {
            const dmtsSourceWithoutLastLine = dmtsSource.split('\n').slice(0, -1).join('\n')
            const dmtsSourceWithCorrectedSourceMappingURL = `${dmtsSourceWithoutLastLine}\n${dmtsSourceLastLine.replace(/.d.ts.map$/, '.d.mts.map')}`

            const dmtsMapSource = await fs.promises.readFile(dmtsMapPath, 'utf-8')
            const dmtsMapSourceWithCorrectedFile = dmtsMapSource.replace('.d.ts', '.d.mts')

            await fs.promises.writeFile(dmtsPath, dmtsSourceWithCorrectedSourceMappingURL)
            await fs.promises.writeFile(dmtsMapPath, dmtsMapSourceWithCorrectedFile)
          }
        }
      }

      await replaceTscAliasPaths({ outDir: declarationDir })
    },
  }
}
