import { bundleRequire } from 'bundle-require'

const { mod } = await bundleRequire({ filepath: './rollup.config.ts' })

const config = mod.default

export default config
