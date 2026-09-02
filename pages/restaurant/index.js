import { useSearchParams } from "next/navigation";
import RestaurantsGrid from "./restocomponent/restoalldata";
import RestaurantsGrid1 from "../../src/components/home/module-wise-components/food/foodUpdateComp/Restorentdata";
import MainLayout from "../../src/components/layout/MainLayout"// adjust path if needed

export default function RestaurantHomePage({ configData }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return (
    <MainLayout configData={configData}>
      {view === "all" ? <RestaurantsGrid /> : <RestaurantsGrid1 />}
    </MainLayout>
  );
}
