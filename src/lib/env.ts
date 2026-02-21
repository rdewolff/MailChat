import { z } from "zod";

function isValidDatabaseUrl(value: string) {
  if (value.startsWith("file:")) {
    return true;
  }

  return z.string().url().safeParse(value).success;
}

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional(),
);

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_SECRET: optionalString,
  DATABASE_URL: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().optional(),
    )
    .refine((value) => !value || isValidDatabaseUrl(value), "DATABASE_URL must be a URL or file: path"),
  REDIS_URL: optionalUrl,
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  WHISPERIT_API_URL: optionalUrl,
  WHISPERIT_API_KEY: optionalString,
});

export const env = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  WHISPERIT_API_URL: process.env.WHISPERIT_API_URL,
  WHISPERIT_API_KEY: process.env.WHISPERIT_API_KEY,
});
