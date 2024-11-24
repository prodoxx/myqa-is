import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(2),
  password: z.string().min(6).max(25),
});
