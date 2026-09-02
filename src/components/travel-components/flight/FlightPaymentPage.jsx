// src/components/flights/FlightPaymentPage.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BusPaymentQRModal from "../../../components/travel-components/buses/BusPaymentQRModal";
import Swal from "sweetalert2";
import { useFlightBook } from "components/travel-hooks/flight/useFlightBook";
import { useFlightPaymentInitiate } from "components/travel-hooks/flight/useFlightPaymentInitiate";
import { useFlightPaymentStatus } from "components/travel-hooks/flight/useFlightPaymentStatus";
import { useFlightTicket } from "components/travel-hooks/flight/useFlightTicket";
import { useFlightPaymentCancel } from "components/travel-hooks/flight/useFlightPaymentCancel";


const TITLE_MAP = {
  "Mr.": "Mr",
  Mr: "Mr",
  "Mrs.": "Ms",
  Mrs: "Ms",
  "Ms.": "Ms",
  Ms: "Ms",
  Miss: "Ms",
  Mstr: "Mr",
  Master: "Mr",
  "Dr.": "Dr",
  Dr: "Dr",
  DR: "Dr",
  "Prof.": "Mr",
  Prof: "Mr",
  PROF: "Mr",
  CHD: "Mr",
  MST: "Mr",
  Inf: "Mr",
};

const normalizeTitle = (title, fallback = "Mr") => {
  const mapped = TITLE_MAP[title];
  if (mapped) return mapped;
  const fb = TITLE_MAP[fallback] || fallback;
  return fb.slice(0, 2);
};

// ── DUPLICATE-CALL GUARD (sessionStorage-based) ───────────────────────────
// `useRef` guards (hasStartedRef, combinedBookCalledRef, ticketFlowStartedRef)
// sirf RE-RENDERS ke against kaam karte hain. Par React 18 StrictMode (dev
// mode) ek component ko mount → unmount → remount karta hai — is remount ke
// baad SAARE refs fresh (`false`) ban jaate hain, isliye poora Book →
// Initiate → Ticket flow dobara chal jaata tha, aur backend me 2 alag
// PNR/Ticket ban jaate the.
//
// sessionStorage remount ke baad bhi persist karta hai, isliye ek baar
// kisi traceId ke liye Book ya Ticket call ho jaaye, to dobara wahi call
// (chahe StrictMode remount ho, chahe user peeche-aage navigate kare)
// kabhi nahi jaayegi — jab tak traceId khud hi naya na ho (naya search).
const alreadyProcessed = (key) => {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};
const markProcessed = (key) => {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* sessionStorage unavailable — ref-based guard still applies */
  }
};
const clearProcessed = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* no-op */
  }
};

function ProcessingScreen({ text }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f4fa",
        fontFamily: "'Inter', sans-serif",
        gap: 16,
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth="2.5"
        style={{ animation: "spin 0.9s linear infinite" }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: 0 }}>
        {text}
      </p>
      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
        Please do not refresh or go back
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function FlightPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    flight,
    returnFlight,
    searchMeta,
    travellers,
    contact,
    billing,
    gst,
    seatSelections,
    selectedMeals,
    selectedBaggage,
    isLCC,
    isReturnLCC,
    traceId,
    resultIndex,
    returnResultIndex,
    fareQuote,
    returnFareQuote,
  } = location.state || {};

  const isRoundTrip = !!returnFlight;

  // ✅ combined international round-trip flag — BookFlight/SSR se
  // `searchMeta.isCombinedRoundTrip` already thread ho raha hai. Isse
  // decide hota hai ki Book/Initiate/Ticket — teeno APIs sirf EK baar,
  // ek hi ResultIndex (`resultIndex`) ke saath call hongi — bilkul jaisa
  // demo payload me dikhaya gaya (ek hi ResultIndex, ek hi Passengers array,
  // koi doosra ResultIndex/BookingId/PNR nahi).
  //
  // ── FIX (root cause of the double-book bug): agar upstream se
  //    `searchMeta.isCombinedRoundTrip` kisi wajah se `true` set nahi hota
  //    (BookFlight page me flag miss ho gaya ho), to code galti se
  //    "non-combined" branch me chala jaata tha, jo `bookLegIfNeeded("return")`
  //    ko `returnResultIndex` ke saath call karta hai. Combined trip me
  //    alag return ResultIndex hota hi nahi (sirf ek hi combined index
  //    hota hai), isliye `returnResultIndex` hamesha `null`/`undefined`
  //    rehta hai — aur ye dusri book call `"ResultIndex: This field may
  //    not be null"` error ke saath fail ho jaati thi.
  //
  //    Ab hum sirf upstream flag pe bharosa nahi karte — DATA se bhi
  //    verify karte hain: agar round-trip hai aur `returnResultIndex`
  //    bilkul hai hi nahi, to ye zaroor combined round-trip hai (kyunki
  //    non-combined round-trip me hamesha do alag ResultIndex aate hain).
  //    Isse ye bug upstream flag sahi ho ya na ho, hamesha guard ho jaata
  //    hai. ───────────────────────────────────────────────────────────
  const isCombinedRoundTrip =
    !!searchMeta?.isCombinedRoundTrip || (isRoundTrip && !returnResultIndex);

  const onwardIsLCC =
    isLCC ?? flight?.IsLCC ?? fareQuote?.Results?.IsLCC ?? false;
  const returnIsLCC =
    isReturnLCC ??
    returnFlight?.IsLCC ??
    returnFareQuote?.Results?.IsLCC ??
    false;

  // ── Round-trip me (non-combined case) har API leg-by-leg (sequentially)
  //    chalti hai: onward: book(if non-LCC) → initiate → status → ticket
  //    return: book(if non-LCC) → initiate → status → ticket
  //    One-way me legs = ["onward"] hi rehta hai, purana flow same.
  //    Combined case me legs ka concept hi nahi lagta — sab kuch ek hi
  //    call me hota hai (neeche runRoundTripFlow me handle hai). ─────────
  const legs = isRoundTrip ? ["onward", "return"] : ["onward"];
  const [legIndex, setLegIndex] = useState(0);

  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [flowError, setFlowError] = useState(null);
  const hasStartedRef = useRef(false);
  const [processingText, setProcessingText] = useState(
    "Preparing your payment...",
  );

  const bookingResultsRef = useRef({ onward: null, return: null });
  const ticketsRef = useRef({ onward: null, return: null });
  const ticketFlowStartedRef = useRef(false); // current-leg ke liye guard, har leg pe reset hota hai

  // ── dedicated guard specifically for the COMBINED round-trip book
  //    call. `hasStartedRef` already stops the outer effect from firing
  //    the whole flow twice, but this extra ref makes `bookCombinedIfNeeded`
  //    itself idempotent — even if it were ever invoked a second time
  //    (retry logic, fast re-render, StrictMode edge case, etc.) the
  //    actual Book API will still only ever go out once for this page
  //    instance. Reset to false only on a failed booking so a genuine
  //    retry after an error is still allowed. ─────────────────────────────
  const combinedBookCalledRef = useRef(false);

  const { bookFlight, loading: bookingLoading } = useFlightBook();
  const { initiatePayment, loading: initiateLoading } =
    useFlightPaymentInitiate();
  const { status, startPolling, stopPolling } = useFlightPaymentStatus();
  const { generateTicket, loading: ticketLoading } = useFlightTicket();
  const { cancelPayment: cancelFlightPayment } = useFlightPaymentCancel();

  // ── Fare breakdown ────────────────────────────────────────────────────────
  const buildFareBreakdown = (fareResult, paxType, paxCount) => {
    const f = fareResult?.Results?.Fare;
    const breakdown = fareResult?.Results?.FareBreakdown;
    if (breakdown && breakdown.length > 0) return breakdown;
    if (!f) return undefined;
    return [
      {
        CFARAmount: 0,
        DCFARAmount: 0,
        SegmentDetails: [],
        Currency: f.Currency || "INR",
        PassengerType: paxType || 1,
        PassengerCount: paxCount || 1,
        BaseFare: f.BaseFare || 0,
        Tax: f.Tax || 0,
        TransactionFee: 0,
        YQTax: f.YQTax || 0,
        TaxBreakUp: [],
        AdditionalTxnFeePub: f.AdditionalTxnFeePub || 0,
        PGCharge: f.PGCharge || 0,
        AdditionalTxnFeeOfrd: f.AdditionalTxnFeeOfrd || 0,
        SupplierReissueCharges: 0,
      },
    ];
  };

  // ── Do fare objects ko ek me merge karna (combined round-trip LCC ticket
  //    call ke liye — total dono legs ka) ────────────────────────────────
  const mergeFareObjects = (a, b) => {
    if (a && !b) return a;
    if (b && !a) return b;
    if (!a && !b) return undefined;
    return {
      ...a,
      BaseFare: (a.BaseFare || 0) + (b.BaseFare || 0),
      Tax: (a.Tax || 0) + (b.Tax || 0),
      YQTax: (a.YQTax || 0) + (b.YQTax || 0),
      AdditionalTxnFeePub:
        (a.AdditionalTxnFeePub || 0) + (b.AdditionalTxnFeePub || 0),
      PGCharge: (a.PGCharge || 0) + (b.PGCharge || 0),
      AdditionalTxnFeeOfrd:
        (a.AdditionalTxnFeeOfrd || 0) + (b.AdditionalTxnFeeOfrd || 0),
    };
  };

  // ── Traveller helpers ─────────────────────────────────────────────────────
  const getAllTravellers = () => [
    ...(travellers?.adults || []),
    ...(travellers?.children || []),
    ...(travellers?.infants || []),
  ];

  const getPaxType = (idx) => {
    const adultCount = searchMeta?.passengers?.adults || 1;
    const childCount = searchMeta?.passengers?.children || 0;
    return idx < adultCount ? 1 : idx < adultCount + childCount ? 2 : 3;
  };

  const getPaxCount = (paxType) => {
    const adultCount = searchMeta?.passengers?.adults || 1;
    const childCount = searchMeta?.passengers?.children || 0;
    const infantCount = searchMeta?.passengers?.infants || 0;
    return paxType === 1
      ? adultCount
      : paxType === 2
        ? childCount
        : infantCount;
  };



  // ── SSR leg splitter ──────────────────────────────────────────────────────
  const splitByLeg = (ssrMap) => {
    if (!ssrMap) return { onward: null, return: null };
    const onward = {},
      ret = {};
    Object.entries(ssrMap).forEach(([key, val]) => {
      if (key.startsWith("return-")) ret[key] = val;
      else onward[key] = val;
    });
    return {
      onward: Object.keys(onward).length > 0 ? onward : null,
      return: Object.keys(ret).length > 0 ? ret : null,
    };
  };

  // ── Meals — array of objects (API accepts list here) ─────────────────────
  const getPaxMeals = (mealsByLeg, travId) => {
    const out = [];
    Object.entries(mealsByLeg || {}).forEach(([segKey, passMap]) => {
      const meal = passMap?.[travId];
      if (meal) {
        out.push({
          AirlineCode: meal._segAirlineCode || meal.AirlineCode || "",
          FlightNumber: meal._segFlightNumber || meal.FlightNumber || "",
          WayType: segKey.startsWith("return-") ? 2 : 1,
          Code: meal.Code || "",
          Description: 2,
          AirlineDescription: meal.AirlineDescription || "",
          Quantity: 1,
          Currency: "INR",
          Price: meal.Price || 0,
          Origin: meal._segOrigin || meal.Origin || "",
          Destination: meal._segDestination || meal.Destination || "",
        });
      }
    });
    return out;
  };

  // ── Baggage — SINGLE OBJECT (dict), API does NOT accept list here
  //    (per-leg call ke liye). Combined round-trip call ke liye neeche
  //    `getPaxBaggageArray` use hota hai jo [onward, return] array deta hai. ──
  const getPaxBaggageObj = (bagsByLeg, travId) => {
    for (const [segKey, passMap] of Object.entries(bagsByLeg || {})) {
      const bag = passMap?.[travId];
      if (bag) {
        return {
          AirlineCode: bag._segAirlineCode || bag.AirlineCode || "",
          FlightNumber: bag._segFlightNumber || bag.FlightNumber || "",
          WayType: segKey.startsWith("return-") ? 2 : 1,
          Code: bag.Code || "",
          Description: 2,
          Weight: bag.Weight || 0,
          Currency: bag.Currency || "INR",
          Price: bag.Price || 0,
          Origin: bag._segOrigin || bag.Origin || "",
          Destination: bag._segDestination || bag.Destination || "",
        };
      }
    }
    return {
      AirlineCode: "",
      FlightNumber: "",
      WayType: 1,
      Code: "NoBaggage",
      Description: 2,
      Weight: 0,
      Currency: "INR",
      Price: 0,
      Origin: "",
      Destination: "",
    };
  };

  // ── Seats — array of objects ──────────────────────────────────────────────
  const getPaxSeats = (seatsByLeg, travId) => {
    const out = [];
    Object.values(seatsByLeg || {}).forEach((passMap) => {
      const seatObj = passMap?.[travId];
      if (seatObj && seatObj.Code) {
        out.push({
          AirlineCode: seatObj._segAirlineCode || seatObj.AirlineCode || "",
          FlightNumber: seatObj._segFlightNumber || seatObj.FlightNumber || "",
          CraftType: seatObj.CraftType || "",
          Origin: seatObj._segOrigin || seatObj.Origin || "",
          Destination: seatObj._segDestination || seatObj.Destination || "",
          AvailablityType: seatObj.AvailablityType ?? 0,
          Description: 2,
          Code: seatObj.Code,
          RowNo: seatObj.RowNo || seatObj.Code.replace(/[A-Za-z]/g, ""),
          SeatNo: seatObj.SeatNo || seatObj.Code.replace(/[0-9]/g, ""),
          SeatType: seatObj.SeatType ?? 0,
          SeatWayType: seatObj.SeatWayType ?? 0,
          Compartment: seatObj.Compartment ?? 0,
          Deck: seatObj.Deck ?? 0,
          Currency: seatObj.Currency || "INR",
          Price: seatObj.Price ?? 0,
        });
      }
    });
    return out;
  };

  // ── Build passengers for one leg (non-combined path ke liye) ──────────────
  const buildPassengersForLeg = (
    fareResult,
    mealsByLeg,
    bagsByLeg,
    seatsByLeg,
  ) => {
    const allTravellers = getAllTravellers();
    const validators = fareResult?.Results?.RequiredFieldValidators || {};
    const mealRequiredForLeg = !!validators.IsMealRequired;
    const seatRequiredForLeg = !!validators.IsSeatRequired;

    return allTravellers.map((trav, idx) => {
      const paxType = getPaxType(idx);
      const paxCount = getPaxCount(paxType);
      const fareBreakdown = buildFareBreakdown(fareResult, paxType, paxCount);
      const fareObj = Array.isArray(fareBreakdown)
        ? fareBreakdown[0]
        : fareBreakdown;

      const paxMeals = mealRequiredForLeg
        ? getPaxMeals(mealsByLeg, trav?.id)
        : [];

      const paxBaggage = getPaxBaggageObj(
        bagsByLeg && Object.keys(bagsByLeg).length > 0 ? bagsByLeg : null,
        trav?.id,
      );

      const paxSeats = seatRequiredForLeg
        ? getPaxSeats(seatsByLeg, trav?.id)
        : [];

      return {
        Title: normalizeTitle(trav.title, trav.gender === 2 ? "Ms" : "Mr"),
        FirstName: trav.firstName,
        LastName: trav.lastName,
        PaxType: paxType,
        // ── Ticket API ko har passenger ka 0-indexed PaxId chahiye,
        //    warna "PaxId: This field is required." validation error aata hai ──
        PaxId: idx,
        Gender: trav.gender || 1,
        AddressLine1: billing?.address || "N/A",
        City: billing?.city || "N/A",
        CountryCode: "IN",
        CountryName: "India",
        ContactNo: contact?.mobile || "",
        Email: contact?.email || "",
        IsLeadPax: idx === 0,
        Nationality: "IN",
        ...(trav.dob && { DateOfBirth: trav.dob }),
        ...(fareObj && { Fare: fareObj }),
        ...(trav.passportNumber &&
          trav.passportExpiry && {
          PassportNo: trav.passportNumber.trim(),
          PassportExpiry: trav.passportExpiry,
        }),
        ...(paxType === 1 &&
          trav.panNumber?.trim() && {
          PanNo: trav.panNumber.trim(),
        }),
        Baggage: paxBaggage,
        ...(mealRequiredForLeg &&
          paxMeals.length > 0 && { MealDynamic: paxMeals }),
        ...(seatRequiredForLeg &&
          paxSeats.length > 0 && { SeatDynamic: paxSeats }),
      };
    });
  };

  // ── Combined round-trip LCC passengers — dono legs ki Fare/Meal/Seat/
  //    Baggage ek hi passenger object me merge hoti hai kyuki ab sirf EK
  //    ticket call hoga poori round-trip ke liye. ─────────────────────────
  const buildCombinedPassengers = () => {
    const allTravellers = getAllTravellers();
    const mealsSplit = splitByLeg(selectedMeals);
    const bagsSplit = splitByLeg(selectedBaggage);
    const seatsSplit = splitByLeg(seatSelections);

    const mealRequired =
      !!fareQuote?.Results?.RequiredFieldValidators?.IsMealRequired ||
      !!returnFareQuote?.Results?.RequiredFieldValidators?.IsMealRequired;
    const seatRequired =
      !!fareQuote?.Results?.RequiredFieldValidators?.IsSeatRequired ||
      !!returnFareQuote?.Results?.RequiredFieldValidators?.IsSeatRequired;

    return allTravellers.map((trav, idx) => {
      const paxType = getPaxType(idx);
      const paxCount = getPaxCount(paxType);

      const onwardFareBreakdown = buildFareBreakdown(fareQuote, paxType, paxCount);
      const returnFareBreakdown = buildFareBreakdown(returnFareQuote, paxType, paxCount);
      const onwardFareObj = Array.isArray(onwardFareBreakdown)
        ? onwardFareBreakdown[0]
        : onwardFareBreakdown;
      const returnFareObj = Array.isArray(returnFareBreakdown)
        ? returnFareBreakdown[0]
        : returnFareBreakdown;
      const combinedFareObj = mergeFareObjects(onwardFareObj, returnFareObj);

      const onwardMeals = mealRequired ? getPaxMeals(mealsSplit.onward, trav?.id) : [];
      const returnMeals = mealRequired ? getPaxMeals(mealsSplit.return, trav?.id) : [];
      const combinedMeals = [...onwardMeals, ...returnMeals];

      const onwardSeats = seatRequired ? getPaxSeats(seatsSplit.onward, trav?.id) : [];
      const returnSeats = seatRequired ? getPaxSeats(seatsSplit.return, trav?.id) : [];
      const combinedSeats = [...onwardSeats, ...returnSeats];

      // ── ASSUMPTION: combined mode me Baggage array [onward, return]
      //    bheji ja rahi hai (WayType 1 aur 2). Backend se confirm kar lena. ──
      const onwardBaggage = getPaxBaggageObj(bagsSplit.onward, trav?.id);
      const returnBaggage = getPaxBaggageObj(bagsSplit.return, trav?.id);
      const combinedBaggage = [onwardBaggage, returnBaggage];

      return {
        Title: normalizeTitle(trav.title, trav.gender === 2 ? "Ms" : "Mr"),
        FirstName: trav.firstName,
        LastName: trav.lastName,
        PaxType: paxType,
        PaxId: idx,
        Gender: trav.gender || 1,
        AddressLine1: billing?.address || "N/A",
        City: billing?.city || "N/A",
        CountryCode: "IN",
        CountryName: "India",
        ContactNo: contact?.mobile || "",
        Email: contact?.email || "",
        IsLeadPax: idx === 0,
        Nationality: "IN",
        ...(trav.dob && { DateOfBirth: trav.dob }),
        ...(combinedFareObj && { Fare: combinedFareObj }),
        ...(trav.passportNumber &&
          trav.passportExpiry && {
          PassportNo: trav.passportNumber.trim(),
          PassportExpiry: trav.passportExpiry,
        }),
        ...(paxType === 1 &&
          trav.panNumber?.trim() && {
          PanNo: trav.panNumber.trim(),
        }),
        BaggageDynamic: combinedBaggage,
        ...(mealRequired && combinedMeals.length > 0 && { MealDynamic: combinedMeals }),
        ...(seatRequired && combinedSeats.length > 0 && { SeatDynamic: combinedSeats }),
      };
    });
  };

  // ── Book API ke liye SLIM passenger object — Fare/Baggage/Meal/Seat kuch
  //    nahi jaata isme, sirf basic traveller info. PaxId 0-indexed hai —
  //    1 passenger → 0, 2 passengers → 0,1, ...n passengers → 0..n-1.
  //    Ticket API me bhi yehi rule follow hota hai. ───────────────────────
  const buildBookPassengers = () => {
    const allTravellers = getAllTravellers();
    return allTravellers.map((trav, idx) => ({
      Title: normalizeTitle(trav.title, trav.gender === 2 ? "Ms" : "Mr"),
      FirstName: trav.firstName,
      LastName: trav.lastName,
      PaxType: getPaxType(idx),
      PaxId: idx,
      ...(trav.dob && { DateOfBirth: trav.dob }),
      Gender: trav.gender || 1,
      AddressLine1: billing?.address || "N/A",
      AddressLine2: "N/A",
      City: billing?.city || "N/A",
      CountryCode: "IN",
      CountryName: "India",
      ContactNo: contact?.mobile || "",
      Email: contact?.email || "",
      IsLeadPax: idx === 0,
      Nationality: "IN",
    }));
  };

  // ── Per-leg helpers (non-combined path) ────────────────────────────────────
  const getLegPassengers = (legKey) => {
    const isOnward = legKey === "onward";
    const legFareQuote = isOnward ? fareQuote : returnFareQuote;
    const mealsSplit = splitByLeg(selectedMeals);
    const bagsSplit = splitByLeg(selectedBaggage);
    const seatsSplit = splitByLeg(seatSelections);
    return buildPassengersForLeg(
      legFareQuote,
      isOnward ? mealsSplit.onward : mealsSplit.return,
      isOnward ? bagsSplit.onward : bagsSplit.return,
      isOnward ? seatsSplit.onward : seatsSplit.return,
    );
  };

  const getLegOriginDestination = (legKey) => {
    const isOnward = legKey === "onward";
    return {
      origin: isOnward ? searchMeta?.fromCity?.code : searchMeta?.toCity?.code,
      destination: isOnward
        ? searchMeta?.toCity?.code
        : searchMeta?.fromCity?.code,
    };
  };

  // ── STEP 1: Book non-LCC leg (LCC ke liye no-op). Round-trip flow me
  //    isi function ko dono legs ("onward" aur "return") ke liye alag-alag
  //    call kiya jaata hai — jo leg LCC hogi wo khud-ba-khud skip ho jayegi,
  //    jo non-LCC hogi uska apne ResultIndex ke saath Book API call hoga.
  //    ⚠️ NOTE: combined round-trip case me yeh function use hi NAHI hota —
  //    uske liye neeche `bookCombinedIfNeeded` alag se hai. ─────────────────
  const bookLegIfNeeded = async (legKey) => {
    const isOnward = legKey === "onward";
    const legIsLCC = isOnward ? onwardIsLCC : returnIsLCC;
    if (legIsLCC) return;

    const legResultIndex = isOnward ? resultIndex : returnResultIndex;

    // ── HARD SAFETY NET ──────────────────────────────────────────────────
    // Is leg ka apna ResultIndex hi nahi hai (jo combined international
    // round-trips me `returnResultIndex` ke saath hamesha hota hai, kyunki
    // wahan ek hi combined index hota hai, alag return index milta hi
    // nahi). Aise me Book API ko null ResultIndex ke saath call karna
    // hamesha "This field may not be null" error deta hai — isliye is
    // leg ko silently SKIP karo, chahe upar ka branch-detection kuch bhi
    // decide kare. Combined case me booking `bookCombinedIfNeeded` se
    // already ho chuki honi chahiye. Ye guard root-cause chahe jo bhi ho,
    // ek galat/duplicate Book call ko hamesha rokta hai.
    if (!legResultIndex) {
      // console.warn(
      //   `[FlightPaymentPage] Skipping Book call for "${legKey}" leg — no ResultIndex available for this leg (this is expected for combined round-trips; booking should already be done via bookCombinedIfNeeded).`,
      // );
      return;
    }

    const passengers = buildBookPassengers();

    setProcessingText(
      isRoundTrip
        ? `Confirming ${isOnward ? "onward" : "return"} booking...`
        : "Confirming your booking...",
    );

    try {
      const bookResult = await bookFlight({
        TraceId: traceId,
        ResultIndex: legResultIndex,
        Passengers: passengers,
      });
      bookingResultsRef.current[legKey] = bookResult;
    } catch (bookErr) {
      await Swal.fire({
        icon: "error",
        title: "Booking Failed",
        html: `
          <div style="font-size:14px;color:#374151;line-height:1.8;text-align:left">
            <div style="margin-bottom:6px">
              <span style="color:#6b7280;font-size:12px">Reason</span><br/>
              <strong>${bookErr.message || "Something went wrong. Please try again."}</strong>
            </div>
            ${bookErr.code
            ? `<div>
              <span style="color:#6b7280;font-size:12px">Error Code</span><br/>
              <strong style="font-family:monospace">${bookErr.code}</strong>
            </div>`
            : ""
          }
          </div>
        `,
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Go Back",
        allowOutsideClick: false,
      }).then(() => navigate("/flights", { replace: true }));
      bookErr.handledByBookingSwal = true;
      throw bookErr;
    }
  };

  // ── Combined round-trip ke liye Book API SIRF EK BAAR call
  // hoti hai, sirf `resultIndex` (ek hi combined ResultIndex) ke saath.
  // Non-LCC ho tabhi call hoga (agar poora combined result LCC hai to
  // book ki zaroorat hi nahi, seedha initiate). Response
  // `bookingResultsRef.current.onward` me store karte hain taaki
  // `buildLegInitiatePayload`/cancel wagera me reuse ho sake.
  //
  // ── FIX #1: `combinedBookCalledRef` guard added — is function ko chahe
  //    kitni bhi baar bulaya jaaye (retry, StrictMode double-invoke, ya
  //    koi bhi race), Book API sirf EK BAAR jaayega is page instance ke
  //    liye. Sirf error hone par hi flag reset hota hai taaki genuine
  //    retry allowed rahe.
  //
  // ── FIX #2: Combined international round-trip ke liye Book API ka
  //    payload sirf `{ TraceId, ResultIndex }` hota hai — `Passengers`
  //    array BILKUL NAHI bhejna hai. Backend response me ek hi BookingId
  //    + PNR mil jaata hai jo dono legs (onward + return) ko cover karta
  //    hai (jaisa confirm hua: `{ BookingId, PNR, Status, ... }`).
  //    Non-combined (`bookLegIfNeeded`) path me Passengers zaroori hai,
  //    isliye wo function untouched hai — sirf combined wale me hataya
  //    hai. ─────────────────────────────────────────────────────────────
  const bookCombinedIfNeeded = async () => {
    // Combined case me poore trip ka LCC-status onward flag se treat
    // karte hain (dono legs same combined result ka hissa hote hain,
    // isliye ek hi IsLCC value applicable hoti hai).
    if (onwardIsLCC) return;

    // ── DUPLICATE-BOOK GUARD (ref + sessionStorage, dono) ──
    // Ref StrictMode remount pe reset ho jaata hai, isliye sirf usi pe
    // bharosa nahi — sessionStorage key traceId ke against persist
    // karta hai, isliye remount ke baad bhi Book API dobara nahi jaayegi.
    const bookKey = `flight_book_done_${traceId}`;
    if (combinedBookCalledRef.current || alreadyProcessed(bookKey)) return;
    combinedBookCalledRef.current = true;
    markProcessed(bookKey);

    setProcessingText("Confirming your booking...");

    try {
      // ⚠️ Combined round-trip Book payload me Passengers NAHI jaate —
      //    sirf TraceId + ResultIndex.
      const bookResult = await bookFlight({
        TraceId: traceId,
        ResultIndex: resultIndex,
      });
      bookingResultsRef.current.onward = bookResult;
    } catch (bookErr) {
      // Booking fail hui — flag reset karo taaki retry pe dobara try ho sake.
      combinedBookCalledRef.current = false;
      clearProcessed(bookKey);
      await Swal.fire({
        icon: "error",
        title: "Booking Failed",
        html: `
          <div style="font-size:14px;color:#374151;line-height:1.8;text-align:left">
            <div style="margin-bottom:6px">
              <span style="color:#6b7280;font-size:12px">Reason</span><br/>
              <strong>${bookErr.message || "Something went wrong. Please try again."}</strong>
            </div>
            ${bookErr.code
            ? `<div>
              <span style="color:#6b7280;font-size:12px">Error Code</span><br/>
              <strong style="font-family:monospace">${bookErr.code}</strong>
            </div>`
            : ""
          }
          </div>
        `,
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Go Back",
        allowOutsideClick: false,
      }).then(() => navigate("/flights", { replace: true }));
      bookErr.handledByBookingSwal = true;
      throw bookErr;
    }
  };

  // ── STEP: Ticket generation for one leg (non-combined / one-way path) ─────
  const ticketLeg = async (legKey) => {
    const isOnward = legKey === "onward";

    setProcessingText(
      isRoundTrip
        ? `Generating ${isOnward ? "onward" : "return"} ticket...`
        : "Generating your ticket...",
    );

    return await generateTicket({
      TraceId: traceId,
    });
  };

  // ── STEP: Combined round-trip ticket — SIRF EK BAAR call hoga, TraceId
  //    ke through backend dono legs (jo bhi book ho chuki / LCC hai) ke
  //    tickets ek saath bana deta hai. Payload me sirf TraceId + Passengers
  //    jaata hai, per-leg ResultIndex/BookingId nahi. ─────────────────────
  const ticketCombined = async () => {
    setProcessingText("Generating your ticket...");
    return await generateTicket({
      TraceId: traceId,
    });
  };

  // ── Per-leg payload for initiate / status / cancel (non-combined path)
  // LCC        → { ResultIndex }
  // Non-LCC    → { BookingId, PNR }   (booking us leg ke liye already ho chuki honi chahiye)
  const buildLegInitiatePayload = (legKey) => {
    const isOnward = legKey === "onward";
    const legIsLCC = isOnward ? onwardIsLCC : returnIsLCC;
    const legResultIndex = isOnward ? resultIndex : returnResultIndex;

    if (legIsLCC) {
      return { ResultIndex: legResultIndex };
    }

    const bookResult = bookingResultsRef.current[legKey];
    const bookingId =
      bookResult?.BookingId ?? bookResult?.FlightItinerary?.BookingId;
    const pnr = bookResult?.PNR ?? bookResult?.FlightItinerary?.PNR;

    return { BookingId: bookingId, PNR: pnr };
  };

  // ── Combined round-trip ke liye initiate/status/cancel
  // payload. LCC → sirf ResultIndex (ek hi combined index). Non-LCC →
  // Book API se mile BookingId/PNR (jo `bookCombinedIfNeeded` ne save
  // kiya `bookingResultsRef.current.onward` me).
  const buildCombinedInitiatePayload = () => {
    if (onwardIsLCC) {
      return { ResultIndex: resultIndex };
    }
    const bookResult = bookingResultsRef.current.onward;
    const bookingId =
      bookResult?.BookingId ?? bookResult?.FlightItinerary?.BookingId;
    const pnr = bookResult?.PNR ?? bookResult?.FlightItinerary?.PNR;
    return { BookingId: bookingId, PNR: pnr };
  };

  // ── Payment initiate — ek time me sirf CURRENT leg ke liye (non-combined) ──
  const initiatePaymentForLeg = async (legKey) => {
    const isOnward = legKey === "onward";
    setProcessingText(
      isRoundTrip
        ? `Preparing ${isOnward ? "onward" : "return"} payment...`
        : "Preparing your payment...",
    );

    const legPayload = buildLegInitiatePayload(legKey);
    const result = await initiatePayment(traceId, legPayload);
    setPaymentData(result);
    setShowPaymentModal(true);
    startPolling(traceId, legPayload);
  };

  // ── Round-trip combined initiate — SIRF EK BAAR call hoga.
  const initiateCombinedPayment = async () => {
    setProcessingText("Preparing your payment...");
    const legPayload = buildCombinedInitiatePayload();
    const result = await initiatePayment(traceId, legPayload);
    setPaymentData(result);
    setShowPaymentModal(true);
    startPolling(traceId, legPayload);
  };
// ── Generic API-error Swal — booking ke alawa har jagah (initiate,
//    unexpected errors, etc.) ke liye. Booking errors already apni
//    Swal dikha chuke hote hain (bookErr.handledByBookingSwal = true),
//    is helper ko sirf unhi errors pe call karo jinke paas ye flag NAHI hai —
//    warna duplicate Swal aa jayegi. ─────────────────────────────────────
const showApiErrorAndGoBack = async (err) => {
  await Swal.fire({
    icon: "error",
    title: "Payment Failed",
    html: `
      <div style="font-size:14px;color:#374151;line-height:1.8;text-align:left">
        <div style="margin-bottom:6px">
          <span style="color:#6b7280;font-size:12px">Reason</span><br/>
          <strong>${err?.message || "Something went wrong. Please try again."}</strong>
        </div>
        ${err?.code
          ? `<div>
            <span style="color:#6b7280;font-size:12px">Error Code</span><br/>
            <strong style="font-family:monospace">${err.code}</strong>
          </div>`
          : ""
        }
      </div>
    `,
    confirmButtonColor: "#16a34a",
    confirmButtonText: "Go Back",
    allowOutsideClick: false,
  });
  navigate("/flights", { replace: true });
};
  // ── Ek leg ka pura cycle: book(if needed) → initiate → (poll status externally) ──
  // ── Sirf ONE-WAY ke liye use hota hai ab (legs = ["onward"]) ──────────────
  const runLegFlow = async (legKey) => {
  try {
    await bookLegIfNeeded(legKey);
    await initiatePaymentForLeg(legKey);
  } catch (err) {
    // console.error("Payment flow error:", err);
    if (!err?.handledByBookingSwal) {
      await showApiErrorAndGoBack(err);
    }
  }
};

  // ── Round-trip ka pura cycle — do alag paths:
  //
  //   A) COMBINED international round-trip (`isCombinedRoundTrip = true`):
  //      Book API SIRF EK BAAR, ek hi `resultIndex` ke saath call hoti hai
  //      (agar poora result non-LCC hai). Uske baad SIRF EK combined
  //      initiate call.
  //
  //   B) NON-COMBINED (normal domestic round-trip, 2 alag ResultIndex):
  //      Purana behavior as-is — `bookLegIfNeeded("onward")` aur
  //      `bookLegIfNeeded("return")` dono call hote hai (jo bhi non-LCC
  //      hai uska), fir ek combined initiate (jo pehle se `{}` bhejta
  //      tha — usko bhi ab non-combined case me as-is rakha hai).
  const runRoundTripFlow = async () => {
  try {
    if (isCombinedRoundTrip) {
      await bookCombinedIfNeeded();
      await initiateCombinedPayment();
    } else {
      await bookLegIfNeeded("onward");
      await bookLegIfNeeded("return");
      setProcessingText("Preparing your payment...");
      const result = await initiatePayment(traceId, {});
      setPaymentData(result);
      setShowPaymentModal(true);
      startPolling(traceId, {});
    }
  } catch (err) {
    // console.error("Payment flow error:", err);
    if (!err?.handledByBookingSwal) {
      await showApiErrorAndGoBack(err);
    }
  }
};

  // ── Current leg/combined payment SUCCESS → ticket banao → agli leg
  //    (agar hai, sirf one-way ke fallback loop me) chalao ─────────────────
  const handleLegPaymentSuccess = async () => {
    // ── DUPLICATE-TICKET GUARD (ref + sessionStorage, dono) ──
    // Yehi wajah thi ki international combined round-trip me 2 ticket
    // ban rahe the: StrictMode remount ke baad `ticketFlowStartedRef`
    // fresh `false` ban jaata tha, isliye payment-status poll se yeh
    // function dobara chal jaata aur Ticket API dusri baar bhi jaati thi
    // (naya PNR/ticket bana deti thi). sessionStorage key remount ke
    // baad bhi persist karti hai, isliye ab same traceId ke liye Ticket
    // API sirf EK BAAR hi jaayegi — chahe StrictMode remount ho ya
    // status-poll multiple baar SUCCESS bhej de.
    const ticketKey = `flight_ticket_done_${traceId}`;
    if (ticketFlowStartedRef.current || alreadyProcessed(ticketKey)) return;
    ticketFlowStartedRef.current = true;
    markProcessed(ticketKey);

    try {
      if (isRoundTrip) {
        const ticket = await ticketCombined();

        const ticketsArr = ticket?.tickets || [];

        // ── HARD SAFETY NET: agar upstream flag (isCombinedRoundTrip) kisi
        //    wajah se galat/false aa gaya ho, to bhi data khud confirm kar
        //    sakta hai — agar backend ne sirf EK hi ticket object diya hai
        //    (jo combined RT me hamesha hota hai), to yeh zaroor single
        //    combined ticket hai, chahe upstream flag kuch bhi kahe.
        const isActuallySingleTicket = ticketsArr.length <= 1;

        if (isCombinedRoundTrip || isActuallySingleTicket) {
          navigate("/flight-ticket", {
            state: {
              combinedTicket: ticket,
              isSingleCombinedTicket: true,
              onwardTicket: ticket,
              returnTicket: null,
              flight,
              returnFlight,
              searchMeta,
              travellers,
              contact,
            },
          });
          return;
        }

        // ── NON-combined round-trip (normal domestic, 2 alag ResultIndex,
        //    backend se 2 alag ticket objects TripIndicator 1 & 2 ke saath) ──
        const onwardTicketObj = ticketsArr.find(
          (t) => t?.FlightItinerary?.TripIndicator === 1,
        );
        const returnTicketObj = ticketsArr.find(
          (t) => t?.FlightItinerary?.TripIndicator === 2,
        );

        navigate("/flight-ticket", {
          state: {
            combinedTicket: ticket,
            isSingleCombinedTicket: false,
            onwardTicket: onwardTicketObj
              ? { tickets: [onwardTicketObj] }
              : ticket,
            // ✅ FIX: agar returnTicketObj nahi mila to `ticket` (poora combined
            // response) fallback mat karo — usse returnTicket galti se truthy
            // ban jaata hai. null hi rakho taaki isRoundTrip sahi se false ho.
            returnTicket: returnTicketObj ? { tickets: [returnTicketObj] } : null,
            flight,
            returnFlight,
            searchMeta,
            travellers,
            contact,
          },
        });
        return;
      }

      // ── One-way path (domestic ya international, dono) — bilkul purana
      //    flow, untouched ──────────────────────────────────────────────
      const legKey = legs[legIndex];
      const ticket = await ticketLeg(legKey);
      ticketsRef.current[legKey] = ticket;

      const nextIdx = legIndex + 1;

      if (nextIdx < legs.length) {
        // ── Return leg abhi baaki hai — reset karke usko chalao ──
        ticketFlowStartedRef.current = false;
        setShowPaymentModal(false);
        setPaymentData(null);
        setPaymentStatus(null);
        setLegIndex(nextIdx);
        await runLegFlow(legs[nextIdx]);
      } else {
        // ── Ticket ban gaya (one-way case) ──
        navigate("/flight-ticket", {
          state: {
            onwardTicket: ticketsRef.current.onward,
            returnTicket: ticketsRef.current.return,
            flight,
            returnFlight,
            searchMeta,
            travellers,
            contact,
          },
        });
      }
    } catch (err) {
      // console.error("Ticket generation error:", err);
      Swal.fire({
        icon: "error",
        title: "Ticket Generation Failed",
        text: err?.message || "Something went wrong. Please contact support.",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/flights", { replace: true });
      });
    }
  };


  useEffect(() => {
    // console.log("[CHECKPOINT 6] FlightPaymentPage resultIndex:", resultIndex);
    if (hasStartedRef.current) return;
    if (!traceId || !resultIndex || !travellers || !contact || !billing) return;
    hasStartedRef.current = true;
    if (isRoundTrip) {
      runRoundTripFlow();
    } else {
      runLegFlow(legs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceId, resultIndex, travellers, contact, billing]);

  // ── Poll monitor — current leg/combined status ko watch karta hai ─────────
  useEffect(() => {
    if (!status?.status) return;
    setPaymentStatus(status.status);

    if (status.status === "SUCCESS") {
      stopPolling();
      handleLegPaymentSuccess();
    } else if (status.status === "FAILED") {
      stopPolling();
      setTimeout(() => navigate("/flights", { replace: true }), 15000);
    } else if (status.status === "EXPIRED") {
      stopPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ── Cancel — combined round-trip me combined payload, non-combined
  //    round-trip me `{}` (as-is purana), oneway me current leg ka payload ──
  const handleFlightCancel = async () => {
    const legPayload = isRoundTrip
      ? (isCombinedRoundTrip ? buildCombinedInitiatePayload() : {})
      : buildLegInitiatePayload(legs[legIndex]);
    await cancelFlightPayment(traceId, legPayload);
    stopPolling();
    navigate("/flights", { replace: true });
  };


  const handleRetry = async () => {
  try {
    if (isRoundTrip) {
      if (isCombinedRoundTrip) {
        await initiateCombinedPayment();
      } else {
        setProcessingText("Preparing your payment...");
        const result = await initiatePayment(traceId, {});
        setPaymentData(result);
        setShowPaymentModal(true);
        startPolling(traceId, {});
      }
    } else {
      await initiatePaymentForLeg(legs[legIndex]);
    }
  } catch (err) {
    // console.error("Retry initiate error:", err);
    await showApiErrorAndGoBack(err);
  }
};

  // ── Error screen ──────────────────────────────────────────────────────────
  if (flowError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f4fa",
          fontFamily: "'Inter', sans-serif",
          gap: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <p
          style={{ fontSize: 16, fontWeight: 600, color: "#dc2626", margin: 0 }}
        >
          {flowError}
        </p>
        <button
          onClick={() => navigate("/flights", { replace: true })}
          style={{
            marginTop: 8,
            padding: "10px 20px",
            borderRadius: 8,
            background: "#16a34a",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Flights
        </button>
      </div>
    );
  }

  if (!showPaymentModal && (bookingLoading || initiateLoading)) {
    return <ProcessingScreen text={processingText} />;
  }

  if (paymentStatus === "SUCCESS" || ticketLoading) {
    return <ProcessingScreen text={processingText} />;
  }

  const currentLegResultIndex = isRoundTrip
    ? resultIndex
    : legs[legIndex] === "onward"
      ? resultIndex
      : returnResultIndex;

  return (
    <BusPaymentQRModal
      visible={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      paymentData={paymentData}
      onRetry={handleRetry}
      onSuccess={handleLegPaymentSuccess}
      paymentStatus={paymentStatus}
      traceId={traceId}
      resultIndex={currentLegResultIndex}
      onCancelPayment={handleFlightCancel}
    />
  );
}