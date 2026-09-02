import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getGuestId } from "../../helper-functions/getToken";

const AuthGuard = (props) => {
  const { children, from } = props;
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { configData } = useSelector((state) => state.configData);
  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }
      const token = localStorage.getItem("token");
      const guest = getGuestId();
      if (token || guest) {
        setChecked(true);
      } else if (guest && configData?.guest_checkout_status === 1) {
        setChecked(true);
      } else {
        router.push(
          {
            pathname: "/home",
            query: { from: from },
          },
          undefined,
          { shallow: true }
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady]
  );

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return <>{children}</>;
};

export default AuthGuard;
