import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import AuthForm from "@/components/auth/AuthForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { signUp } from "@/lib/auth/actions";
import styles from "../auth.module.scss";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; display_name?: string }>;
}) {
  const { error, email, display_name } = await searchParams;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Link href="/">
          <Wordmark size="sm" />
        </Link>
        <h1 className={styles.title}>Join the hive</h1>
        <p className={styles.subtitle}>
          Create an account to start rating actor performances.
        </p>
      </div>

      <AuthForm
        mode="signup"
        action={signUp}
        error={error}
        defaultEmail={email}
        defaultName={display_name}
      />

      <div className={styles.divider}>or</div>
      <GoogleButton />

      <p className={styles.alt}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
