"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Button from "@/components/ui/Button";
import { useT } from "@/lib/i18n/provider";
import styles from "./AuthForm.module.scss";

type Mode = "login" | "signup";

interface AuthFormProps {
  mode: Mode;
  action: (formData: FormData) => void;
  error?: string;
  message?: string;
  /** Prefilled when a submit failed, so the user doesn't retype. */
  defaultEmail?: string;
  defaultName?: string;
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 4.24A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a18.4 18.4 0 0 1-2.16 3.19M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 7 10 7a10.5 10.5 0 0 0 5.39-1.61" />
      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function SubmitButton({ label }: { label: string }) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <Button variant="accent" type="submit" disabled={pending} className={styles.submit}>
      {pending ? t.auth.submitting : label}
    </Button>
  );
}

export default function AuthForm({
  mode,
  action,
  error,
  message,
  defaultEmail,
  defaultName,
}: AuthFormProps) {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className={styles.form}>
      {mode === "signup" && (
        <label className={styles.field}>
          <span>{t.auth.displayName}</span>
          <input
            name="display_name"
            type="text"
            autoComplete="name"
            defaultValue={defaultName}
            required
          />
        </label>
      )}

      <label className={styles.field}>
        <span>{t.auth.email}</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          required
        />
      </label>

      <label className={styles.field}>
        <span>{t.auth.password}</span>
        <div className={styles.passwordWrap}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={6}
            required
          />
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </label>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.message}>{message}</p>}

      <SubmitButton
        label={mode === "signup" ? t.auth.submitSignup : t.auth.submitLogin}
      />
    </form>
  );
}
