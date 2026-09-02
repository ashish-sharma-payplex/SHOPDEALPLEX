// src/hooks/flighthooks/useSSR.js
import { useState, useCallback, useRef } from "react";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";

const PAX_TYPE = { Adult: 1, Child: 2, Infant: 3 };
const GENDER_BY_TITLE = { Mr: 1, Ms: 2 };

// ── Age calculator — reference date = flight departure date ──
const calcAge = (dob, referenceDate) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  const ref = referenceDate ? new Date(referenceDate) : new Date();
  if (isNaN(ref)) return null;
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
};

function buildSharedFields(contact, billing) {
  const shared = {
    AddressLine1: (billing?.address || "").trim(),
    AddressLine2: "N/A",
    City: (billing?.city || "").trim(),
    CountryCode: "IN",
    CountryName: "India",
    ContactNo: (contact?.mobile || "").trim(),
    Email: (contact?.email || "").trim(),
    Nationality: "IN",
  };

  ["City", "ContactNo", "Email"].forEach((key) => {
    if (!shared[key]) {
      // console.warn(
      //   `[useSSR] Shared field "${key}" is blank when building SSR payload. ` +
      //     `Check that contact/billing state is populated before calling saveSSR.`,
      //   { contact, billing },
      // );
    }
  });

  return shared;
}

// ── docRequired = requiresPassport || requiresPan (compute hoke saveSSR se
//    yahan tak thread hota hai). Ye decide karta hai Child/Infant guardian
//    ka data denge ya khud ka. ──────────────────────────────────────────
function buildPassengerBase(
  trav,
  idx,
  sharedFields,
  flightDepartureDate,
  requiresPassport,
  requiresPan,
    gst,
) {
  // ── Passport required (Book/Ticket/FullDetail — koi bhi) → Child/Infant
  //    apna khud ka Passport denge, koi guardian nahi. ────────────────────
  const childInfantOwnDocs =
    (trav.ptype === "Infant" || trav.ptype === "Child") && !!requiresPassport;

  // ── Guardian sirf tab jab Passport NAHI chahiye lekin PAN chahiye ──────
  const needsGuardianOnly =
    (trav.ptype === "Infant" || trav.ptype === "Child") &&
    !requiresPassport &&
    !!requiresPan;

  const usesGuardian = needsGuardianOnly;

  const passenger = {
    Title: trav.title || "Mr",
    FirstName: trav.firstName || "",
    LastName: trav.lastName || "",
    PaxType: PAX_TYPE[trav.ptype] || 1,
    PaxId: idx + 1,
    DateOfBirth: trav.dob || "",
    Gender: GENDER_BY_TITLE[trav.title] || 1,
    IsLeadPax: idx === 0,
    ...sharedFields,
    Nationality: trav.nationality || sharedFields.Nationality,
  };

  if (!usesGuardian) {
    if (trav.panNumber) passenger.PAN = trav.panNumber;
    if (trav.passportNumber) passenger.PassportNo = trav.passportNumber;
    if (trav.passportExpiry) passenger.PassportExpiry = trav.passportExpiry;
    if (trav.passportIssueDate)
      passenger.PassportIssueDate = trav.passportIssueDate;
    if (trav.passportIssueCountry)
      passenger.PassportIssueCountryCode = trav.passportIssueCountry;
  }

  // ── Guardian — ab hamesha PAN hi jaata hai. childInfantOwnDocs case
  //    (passport required) me usesGuardian hi false hota hai, isliye ye
  //    block sirf "PAN required, Passport nahi" wale case me chalta hai. ──
  if (usesGuardian) {
    if (trav.guardianPan && trav.guardianPan.trim()) {
      passenger.GuardianDetails = {
        Title: trav.guardianTitle || "Mr",
        FirstName: trav.guardianFirstName || "",
        LastName: trav.guardianLastName || "",
        PAN: trav.guardianPan.trim(),
      };
    }
  }

  // ── GST — backend serializer (FlightPassengerSerializer) GST ko NESTED
  //    object ki tarah expect nahi karta, balki FLAT fields ki tarah, seedhe
  //    lead passenger (idx === 0 / IsLeadPax) ke object ke andar:
  //      GSTCompanyName, GSTNumber, GSTCompanyAddress,
  //      GSTCompanyContactNumber, GSTCompanyEmail
  //    FlightSaveSSRService ka GST validation block bhi seedha
  //    `lead_passenger.get("GSTNumber")` jaisa flat read karta hai — koi
  //    "GSTDetails" wrapper support nahi hai. Isliye yahan wrapper object
  //    NAHI banate, seedhe passenger ke top-level fields set karte hain. ──
  if (gst && idx === 0) {
    passenger.GSTCompanyName = gst.GSTCompanyName || "";
    passenger.GSTNumber = gst.GSTNumber || "";
    passenger.GSTCompanyAddress = gst.GSTCompanyAddress || "";
    passenger.GSTCompanyContactNumber = gst.GSTCompanyContactNumber || "";
    passenger.GSTCompanyEmail = gst.GSTCompanyEmail || "";
  }

  return passenger;
}


// ── Combined round-trip passengers — dono legs ka meal/baggage/seat data
//    EK HI passenger object me jaata hai (kyunki ek hi Journey/ResultIndex
//    hoga). Har item apna WayType khud carry karta hai (_leg se derive) ──
function buildPassengersCombined({
  allTravellers,
  selectedMeals,
  selectedBaggage,
  seatSelections,
  sharedFields,
  flightDepartureDate,
  requiresPassport,
  requiresPan,
  gst,
}) {
  return allTravellers.map((trav, idx) => {
    const passenger = buildPassengerBase(
      trav,
      idx,
      sharedFields,
      flightDepartureDate,
      requiresPassport,
      requiresPan,
        gst,
    );

    const mealDynamic = [];
    Object.values(selectedMeals || {}).forEach((segMap) => {
      const meal = segMap?.[trav.id];
      if (meal) {
        mealDynamic.push({
          AirlineCode: meal._segAirlineCode || "",
          FlightNumber: meal._segFlightNumber || "",
          WayType: meal._leg === "return" ? 2 : 1,
          Code: meal.Code,
          Description: 2,
          AirlineDescription: meal.AirlineDescription || meal.Code,
          Quantity: 1,
          Currency: "INR",
          Price: meal.Price || 0,
          Origin: meal._segOrigin || "",
          Destination: meal._segDestination || "",
        });
      }
    });
    if (mealDynamic.length) passenger.MealDynamic = mealDynamic;

    const baggageDynamic = [];
    Object.values(selectedBaggage || {}).forEach((segMap) => {
      const bag = segMap?.[trav.id];
      if (bag) {
        baggageDynamic.push({
          AirlineCode: bag._segAirlineCode || "",
          FlightNumber: bag._segFlightNumber || "",
          WayType: bag._leg === "return" ? 2 : 1,
          Code: bag.Code,
          Description: 2,
          Weight: bag.Weight,
          Currency: "INR",
          Price: bag.Price || 0,
          Origin: bag._segOrigin || "",
          Destination: bag._segDestination || "",
        });
      }
    });
    if (baggageDynamic.length) passenger.Baggage = baggageDynamic;

    const seatDynamic = [];
    Object.values(seatSelections || {}).forEach((segMap) => {
      const seat = segMap?.[trav.id];
      if (seat) {
        seatDynamic.push({
          AirlineCode: seat._segAirlineCode || "",
          FlightNumber: seat._segFlightNumber || "",
          CraftType: seat.CraftType || "",
          Origin: seat._segOrigin || "",
          Destination: seat._segDestination || "",
          AvailablityType: seat.AvailablityType ?? 1,
          Description: seat.Description ?? 2,
          Code: seat.Code,
          RowNo: seat.RowNo || "",
          SeatNo: seat.SeatNo || "",
          SeatType: seat.SeatType ?? 1,
          SeatWayType: seat._leg === "return" ? 2 : 1,
          Compartment: seat.Compartment ?? 2,
          Deck: seat.Deck ?? 1,
          Currency: "INR",
          Price: seat.Price || 0,
        });
      }
    });
    if (seatDynamic.length) passenger.SeatDynamic = seatDynamic;

    return passenger;
  });
}

function buildPassengersForLeg({
  leg,
  allTravellers,
  selectedMeals,
  selectedBaggage,
  seatSelections,
  sharedFields,
  flightDepartureDate,
  requiresPassport,
  requiresPan,
  gst,
}) {
  return allTravellers.map((trav, idx) => {
    const passenger = buildPassengerBase(
      trav,
      idx,
      sharedFields,
      flightDepartureDate,
      requiresPassport,
      requiresPan,
      gst,
    );

    const mealDynamic = [];
    Object.values(selectedMeals || {}).forEach((segMap) => {
      const meal = segMap?.[trav.id];
      if (meal && meal._leg === leg) {
        mealDynamic.push({
          AirlineCode: meal._segAirlineCode || "",
          FlightNumber: meal._segFlightNumber || "",
          WayType: leg === "onward" ? 1 : 2,
          Code: meal.Code,
          Description: 2,
          AirlineDescription: meal.AirlineDescription || meal.Code,
          Quantity: 1,
          Currency: "INR",
          Price: meal.Price || 0,
          Origin: meal._segOrigin || "",
          Destination: meal._segDestination || "",
        });
      }
    });
    if (mealDynamic.length) passenger.MealDynamic = mealDynamic;

    const baggageDynamic = [];
    Object.values(selectedBaggage || {}).forEach((segMap) => {
      const bag = segMap?.[trav.id];
      if (bag && bag._leg === leg) {
        baggageDynamic.push({
          AirlineCode: bag._segAirlineCode || "",
          FlightNumber: bag._segFlightNumber || "",
          WayType: leg === "onward" ? 1 : 2,
          Code: bag.Code,
          Description: 2,
          Weight: bag.Weight,
          Currency: "INR",
          Price: bag.Price || 0,
          Origin: bag._segOrigin || "",
          Destination: bag._segDestination || "",
        });
      }
    });
    if (baggageDynamic.length) passenger.Baggage = baggageDynamic;

    const seatDynamic = [];
    Object.values(seatSelections || {}).forEach((segMap) => {
      const seat = segMap?.[trav.id];
      if (seat && seat._leg === leg) {
        seatDynamic.push({
          AirlineCode: seat._segAirlineCode || "",
          FlightNumber: seat._segFlightNumber || "",
          CraftType: seat.CraftType || "",
          Origin: seat._segOrigin || "",
          Destination: seat._segDestination || "",
          AvailablityType: seat.AvailablityType ?? 1,
          Description: seat.Description ?? 2,
          Code: seat.Code,
          RowNo: seat.RowNo || "",
          SeatNo: seat.SeatNo || "",
          SeatType: seat.SeatType ?? 1,
          SeatWayType: leg === "onward" ? 1 : 2,
          Compartment: seat.Compartment ?? 2,
          Deck: seat.Deck ?? 1,
          Currency: "INR",
          Price: seat.Price || 0,
        });
      }
    });
    if (seatDynamic.length) passenger.SeatDynamic = seatDynamic;

    return passenger;
  });
}

export function useSSR() {
  const [onwardSSR, setOnwardSSR] = useState(null);
  const [returnSSR, setReturnSSR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ── DEDUPE GUARD (bilkul useFareRule.js / useFlightBook.js jaisa) ──────
  // SSRSeatPage.jsx me `useEffect(() => { fetchSSR(...) }, [])` se call
  // hota hai. StrictMode dev-mode me component mount → unmount → remount
  // hota hai, jisse ye effect do baar chal jaata hai — result: SSR API
  // do baar hit hoti hai. Yahan hook ke andar hi persistent ref-based
  // guard laga rahe hain: same TraceId+ResultIndex ke liye fetchSSR do
  // baar bulaya jaaye, to doosri call NAYA network request nahi bhejegi.
  const ssrInFlightRef = useRef(null);   // { key, promise }
  const ssrCompletedRef = useRef(null);  // { key, onward, ret }

  // ─── fetchSSR: doosri call skip karo jab combined round-trip ho ───────────
  const fetchSSR = useCallback(
    async ({ traceId, onwardResultIndex, returnResultIndex, isCombinedRoundTrip = false }) => {
      const key = JSON.stringify({
        traceId,
        onwardResultIndex,
        // combined case me returnResultIndex ko key me bhi force null
        // rakhte hain, taaki upstream se kabhi galti se truthy value aa
        // bhi jaaye to bhi wahi ek hi combined fetch match ho.
        returnResultIndex: isCombinedRoundTrip ? null : returnResultIndex,
      });

      // Is TraceId+ResultIndex ke liye SSR already fetch ho chuki hai —
      // dobara API call na maaro, cached state hi wapas set kar do.
      if (ssrCompletedRef.current && ssrCompletedRef.current.key === key) {
        setOnwardSSR(ssrCompletedRef.current.onward);
        setReturnSSR(ssrCompletedRef.current.ret);
        return;
      }

      // Is TraceId+ResultIndex ke liye SSR already in-flight hai — dusri
      // call ko wahi pending promise thama do, naya request mat bhejo.
      if (ssrInFlightRef.current && ssrInFlightRef.current.key === key) {
        return ssrInFlightRef.current.promise;
      }

      setLoading(true);
      setError(null);
      setOnwardSSR(null);
      setReturnSSR(null);

      const promise = (async () => {
        try {
          const onwardRes = await flightFetch(FLIGHT_ENDPOINTS.SSR, {
            method: "POST",
            body: { TraceId: traceId, ResultIndex: onwardResultIndex },
          });
          const onwardData = onwardRes?.success ? onwardRes.data : null;
          if (onwardData) setOnwardSSR(onwardData);

          let returnData = null;

          // ── Combined international round-trip: ek hi ResultIndex se
          //    dono legs (onward + return) ka poora SSR data mil jaata hai
          //    (SeatsBySegment me sabhi segments already aa jaate hain).
          //    Isliye doosri API call KABHI nahi karni — chahe
          //    returnResultIndex accidentally truthy ho. ─────────────────
          if (!isCombinedRoundTrip && returnResultIndex) {
            const returnRes = await flightFetch(FLIGHT_ENDPOINTS.SSR, {
              method: "POST",
              body: { TraceId: traceId, ResultIndex: returnResultIndex },
            });
            if (returnRes?.success) {
              returnData = returnRes.data;
              setReturnSSR(returnData);
            }
          }

          // Success — cache karo taaki future duplicate calls
          // (StrictMode remount, retry, etc.) network hit na karein.
          ssrCompletedRef.current = { key, onward: onwardData, ret: returnData };
        } catch (err) {
          // ✅ FIX: `throw err;` HATA diya. fetchSSR ko SSRSeatPage.jsx me
          // `useEffect(() => { fetchSSR(...) }, [])` se bina await/.catch
          // ke fire-and-forget call kiya jaata hai. Agar yahan se error
          // rethrow hota hai to wo ek UNHANDLED PROMISE REJECTION ban
          // jaata hai — Next.js dev overlay use crash dikha deta hai,
          // jabki ye ek normal situation hai (session/TraceId expire,
          // supplier error, etc.) jo already `error` state ke through UI
          // me gracefully handle ho rahi hai (SSRSeatPage ka error-screen
          // block `error` state dekh ke Retry button dikhata hai).
          setError(err.message);
          // completedRef intentionally set nahi karte — retry allowed rahe.
        } finally {
          setLoading(false);
          ssrInFlightRef.current = null;
        }
      })();

      ssrInFlightRef.current = { key, promise };
      return promise;
    },
    [],
  );

  const saveSSR = useCallback(
    async ({
      traceId,
      onwardResultIndex,
      returnResultIndex,
      isCombinedRoundTrip = false,
      allTravellers,
      selectedMeals,
      selectedBaggage,
      seatSelections = {},
      contact,
      billing,
      gst = null,
      requiresPassport = false,
      requiresPan = false,
      flightDepartureDate,
    }) => {
      setSaving(true);
      setError(null);

      try {
        const sharedFields = buildSharedFields(contact, billing);

        // ── Combined round-trip → EK hi Journey (ek ResultIndex), sab
        //    kuch ek hi passenger object me. Non-combined → purana
        //    behavior, do alag Journeys. ─────────────────────────────────
       const journeys = isCombinedRoundTrip
          ? [
              {
                ResultIndex: onwardResultIndex,
                Passengers: buildPassengersCombined({
                  allTravellers,
                  selectedMeals,
                  selectedBaggage,
                  seatSelections,
                  sharedFields,
                  flightDepartureDate,
                  requiresPassport,
                  requiresPan,
                  gst,
                }),
              },
            ]
          : [
              {
                ResultIndex: onwardResultIndex,
                Passengers: buildPassengersForLeg({
                  leg: "onward",
                  allTravellers,
                  selectedMeals,
                  selectedBaggage,
                  seatSelections,
                  sharedFields,
                  flightDepartureDate,
                  requiresPassport,
                  requiresPan,
                  gst,
                }),
              },
              ...(returnResultIndex
                ? [
                    {
                      ResultIndex: returnResultIndex,
                      Passengers: buildPassengersForLeg({
                        leg: "return",
                        allTravellers,
                        selectedMeals,
                        selectedBaggage,
                        seatSelections,
                        sharedFields,
                        flightDepartureDate,
                        requiresPassport,
                        requiresPan,
                        gst,
                      }),
                    },
                  ]
                : []),
            ];

const payload = { TraceId: traceId, Journeys: journeys };

        // console.log("[useSSR] SSR_SAVE payload ->", payload);

        const res = await flightFetch(FLIGHT_ENDPOINTS.SSR_SAVE, {
          method: "POST",
          body: payload,
        });

        if (!res?.success) {
          setError(res?.message || "SSR save failed");
          return { success: false, data: res };
        }
        return { success: true, data: res.data };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { onwardSSR, returnSSR, loading, error, saving, fetchSSR, saveSSR };
}