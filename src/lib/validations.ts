import { z } from "zod";

// Schema de validação para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

// Schema de validação para cadastro
export const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(128, "Senha muito longa"),
  confirmPassword: z
    .string()
    .min(1, "Confirmação de senha é obrigatória"),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "Você deve aceitar os termos de uso",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Schema de validação para forgot password
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido"),
});

// Schema de validação para reset password
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(128, "Senha muito longa"),
  confirmPassword: z
    .string()
    .min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Schema de validação para profile setup - Step 1
export const profileStep1Schema = z.object({
  displayName: z
    .string()
    .min(1, "Nome de exibição é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome muito longo"),
  bio: z
    .string()
    .max(150, "Bio muito longa")
    .optional(),
  avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

// Schema de validação para profile setup - Step 2
export const profileStep2Schema = z.object({
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória"),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"], {
      required_error: "Gênero é obrigatório",
    }),
  height: z
    .number()
    .min(100, "Altura deve ser pelo menos 100cm")
    .max(250, "Altura deve ser no máximo 250cm")
    .optional(),
  weight: z
    .number()
    .min(30, "Peso deve ser pelo menos 30kg")
    .max(300, "Peso deve ser no máximo 300kg")
    .optional(),
});

// Schema de validação para profile setup - Step 3
export const profileStep3Schema = z.object({
  fitnessLevel: z
    .enum(["beginner", "intermediate", "advanced"], {
      required_error: "Nível de condicionamento é obrigatório",
    }),
  goals: z
    .array(z.enum(["weight_loss", "muscle_gain", "endurance", "general_health", "competition"]))
    .min(1, "Selecione pelo menos um objetivo"),
  activityTypes: z
    .array(z.enum(["running", "cycling", "swimming", "walking", "gym", "yoga", "sports"]))
    .min(1, "Selecione pelo menos um tipo de atividade"),
});

// Types inferidos dos schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileStep1Input = z.infer<typeof profileStep1Schema>;
export type ProfileStep2Input = z.infer<typeof profileStep2Schema>;
export type ProfileStep3Input = z.infer<typeof profileStep3Schema>; 