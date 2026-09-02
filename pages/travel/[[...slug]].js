// pages\travel\[[...slug]].js
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const TravelApp = dynamic(() => import("../../src/components/travel-app/App"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh" }} />,
});

export default function TravelPage() {
  const router = useRouter();

  return <TravelApp key={router.asPath} />;
}