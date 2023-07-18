# @niamori/rollup-config

> NiaMori's rollup config

## Usage

```typescript
// rollup.config.ts

import { defineConfig } from 'rollup'
import { dual, esm, cjs } from '@niamori/rollup-config/presets'

export default defineConfig(await dual())
```
