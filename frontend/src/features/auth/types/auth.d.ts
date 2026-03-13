import { ReactNode } from "react";

export interface AuthLayoutProps {
  children: ReactNode;
}
export interface LoginFormFields {
  email: string;
  password: string;
}
export interface RegistrationFormFields {
  name: string;
  email: string;
  password: string;
}
export interface ResetPasswordFormProps {
  token: string;
}
