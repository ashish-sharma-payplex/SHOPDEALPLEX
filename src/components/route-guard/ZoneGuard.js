import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ZoneGuard = (props) => {
  const { children } = props;
  const router = useRouter();

  // ✅ true rakho — server-side pe children render hoga
  // toh <Head> tags bhi <head> mein aayenge
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setChecked(true);
  }, [router.isReady]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
};

export default ZoneGuard;
