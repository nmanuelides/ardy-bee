import { signOut } from "@/lib/auth/actions";
import { getT } from "@/lib/i18n/server";
import styles from "./UserMenu.module.scss";

/** Shown in the header when signed in: avatar initial + sign-out. */
export default async function UserMenu({ label }: { label: string }) {
  const t = await getT();
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className={styles.menu}>
      <span className={styles.avatar} title={label}>
        {initial}
      </span>
      <form action={signOut}>
        <button className={styles.signout} type="submit">
          {t.common.signOut}
        </button>
      </form>
    </div>
  );
}
