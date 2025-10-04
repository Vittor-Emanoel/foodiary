import { z } from 'zod';

const schema = z.object({
  // cognito
  COGNITO_CLIENT_ID: z.string().min(1),
  COGNITO_CLIENT_SECRET: z.string().min(1),
  COGNITO_POOL_ID: z.string().min(1),
  //database
  MAIN_TABLE_NAME: z.string().min(1),
});

export const env = schema.parse(process.env);
