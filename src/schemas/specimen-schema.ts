import { z } from 'zod'

/** Root shape of `config/specimens.data.json`: theme id → SVG file name under `public/specimens/`. */
export const specimensDataFileSchema = z.record(
  z.string(),
  z
    .string()
    .min(1)
    .regex(/\.svg$/i, 'Specimen value must be a .svg file name'),
)

export type SpecimensDataFile = z.infer<typeof specimensDataFileSchema>
