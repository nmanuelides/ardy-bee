import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import AuthForm from "@/components/auth/AuthForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { signUp } from "@/lib/auth/actions";
import { getT } from "@/lib/i18n/server";
import styles from "../auth.module.scss";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; display_name?: string }>;
}) {
  const t = await getT();
  const { error, email, display_name } = await searchParams;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Link href="/">
          <Wordmark size="sm" />
        </Link>
        <h1 className={styles.title}>{t.auth.joinHive}</h1>
        <p className={styles.subtitle}>{t.auth.signupSub}</p>
      </div>

      <AuthForm
        mode="signup"
        action={signUp}
        error={error}
        defaultEmail={email}
        defaultName={display_name}
      />

      <div className={styles.divider}>{t.auth.or}</div>
      <GoogleButton />

      <p className={styles.alt}>
        {t.auth.haveAccount} <Link href="/login">{t.common.signIn}</Link>
      </p>
    </div>
  );
}
