import { z } from "zod";

const envSchema = z.object({
  RETAILCRM_URL: z.string().url(),
  RETAILCRM_API_KEY: z.string().min(1),
  RETAILCRM_SITE_CODE: z.string().min(1),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),

  ALERT_THRESHOLD_KZT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 50000))
    .pipe(z.number().finite().positive()),

  INTERNAL_API_KEY: z.string().min(10),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  RETAILCRM_URL: process.env.RETAILCRM_URL,
  RETAILCRM_API_KEY: process.env.RETAILCRM_API_KEY,
  RETAILCRM_SITE_CODE: process.env.RETAILCRM_SITE_CODE,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,

  ALERT_THRESHOLD_KZT: process.env.ALERT_THRESHOLD_KZT,

  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
});
