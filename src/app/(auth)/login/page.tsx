import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import AuthForm from "@/components/auth/AuthForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { signInWithPassword } from "@/lib/auth/actions";
import { getT } from "@/lib/i18n/server";
import styles from "../auth.module.scss";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; email?: string }>;
}) {
  const t = await getT();
  const { error, message, email } = await searchParams;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Link href="/">
          <Wordmark size="sm" />
        </Link>
        <h1 className={styles.title}>{t.auth.welcomeBack}</h1>
        <p className={styles.subtitle}>{t.auth.loginSub}</p>
      </div>

      <AuthForm
        mode="login"
        action={signInWithPassword}
        error={error}
        message={message}
        defaultEmail={email}
      />

      <div className={styles.divider}>{t.auth.or}</div>
      <GoogleButton />

      <p className={styles.alt}>
        {t.auth.newToArdy} <Link href="/signup">{t.auth.createAccount}</Link>
      </p>
    </div>
  );
}
