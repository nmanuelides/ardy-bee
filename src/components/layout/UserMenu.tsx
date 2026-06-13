import { signOut } from "@/lib/auth/actions";
import styles from "./UserMenu.module.scss";

/** Shown in the header when signed in: avatar initial + sign-out. */
export default function UserMenu({ label }: { label: string }) {
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className={styles.menu}>
      <span className={styles.avatar} title={label}>
        {initial}
      </span>
      <form action={signOut}>
        <button className={styles.signout} type="submit">
          Sign out
        </button>
      </form>
    </div>
  );
}
