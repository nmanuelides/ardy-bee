import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import AuthForm from "@/components/auth/AuthForm";
import GoogleButton from "@/components/auth/GoogleButton";
import { signInWithPassword } from "@/lib/auth/actions";
import styles from "../auth.module.scss";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <Link href="/">
          <Wordmark size="sm" />
        </Link>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to rate performances and track your favorite actors.
        </p>
      </div>

      <AuthForm
        mode="login"
        action={signInWithPassword}
        error={error}
        message={message}
      />

      <div className={styles.divider}>or</div>
      <GoogleButton />

      <p className={styles.alt}>
        New to Ardy Bee? <Link href="/signup">Create an account</Link>
      </p>
    </div>
  );
}
