import { defineConfig } from 'rollup'
import { esm } from './src/presets'

export default defineConfig(await esm())
