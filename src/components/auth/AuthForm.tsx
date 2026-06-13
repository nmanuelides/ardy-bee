"use client";

import { useFormStatus } from "react-dom";
import Button from "@/components/ui/Button";
import styles from "./AuthForm.module.scss";

type Mode = "login" | "signup";

interface AuthFormProps {
  mode: Mode;
  action: (formData: FormData) => void;
  error?: string;
  message?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button variant="accent" type="submit" disabled={pending} className={styles.submit}>
      {pending ? "One sec…" : label}
    </Button>
  );
}

export default function AuthForm({ mode, action, error, message }: AuthFormProps) {
  return (
    <form action={action} className={styles.form}>
      {mode === "signup" && (
        <label className={styles.field}>
          <span>Display name</span>
          <input name="display_name" type="text" autoComplete="name" required />
        </label>
      )}

      <label className={styles.field}>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={6}
          required
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.message}>{message}</p>}

      <SubmitButton label={mode === "signup" ? "Create account" : "Sign in"} />
    </form>
  );
}
