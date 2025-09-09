import { z } from "zod"

const envSchema = z.object({
  VITE_API_URL: z.string()
  .url().refine(Boolean, { message: "VITE_API_URL precisa ser uma URL válida" }),
})

export const env = envSchema.parse(import.meta.env)