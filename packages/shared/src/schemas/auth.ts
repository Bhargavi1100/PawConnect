import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof RefreshSchema>;

export const PublicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const AuthResponseSchema = z.object({
  user: PublicUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
