import CssBaseline from "@mui/material/CssBaseline";
import SEO from "../../../../src/components/seo";
import MainLayout from "../../../../src/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { useGetConfigData } from "../../../../src/api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../../../src/redux/slices/configData";
import { useEffect } from "react";
import VehicleDetailsPage from "../../../../src/components/home/module-wise-components/rental/components/vehicle-details/VehicleDetailsPage";
import { NoSsr } from "@mui/material";

const VehicleDetails = ({ configData: serverConfigData, vehicleData }) => {
  const dispatch = useDispatch();
  const { landingPageData, configData } = useSelector(
    (state) => state.configData,
  );
  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();

  useEffect(() => {
    if (!configData) configRefetch();
  }, [configData]);

  useEffect(() => {
    if (dataConfig) dispatch(setConfigData(dataConfig));
  }, [dataConfig]);

  const vehicle =
    vehicleData?.vehicle || vehicleData?.data || vehicleData || null;

  const vehicleName =
    vehicle?.name || vehicle?.vehicle_name || vehicle?.title || null;

  const vehicleCategory =
    vehicle?.category?.name || vehicle?.vehicle_category?.name || null;

  const vehicleImage = vehicle?.image_full_url || vehicle?.image || null;

  const seoTitle = vehicleName
    ? `${vehicleName} for Rent | Dealplex Rental`
    : vehicleCategory
    ? `${vehicleCategory} for Rent | Dealplex Rental`
    : "Self Drive Vehicle for Rent | Dealplex Rental";

  const seoDescription = vehicleName
    ? `Book ${vehicleName} on Dealplex. Affordable self-drive rental with hourly and daily plans near you.`
    : "Book self-drive cars and bikes on Dealplex. Affordable hourly and daily rental plans near you.";

  return (
    <>
      <CssBaseline />
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={vehicleImage}
        businessName="Dealplex"
        configData={serverConfigData}
        noIndex={false}
      />
      <MainLayout configData={configData} landingPageData={landingPageData}>
        <NoSsr>
          <VehicleDetailsPage />
        </NoSsr>
      </MainLayout>
    </>
  );
};

export default VehicleDetails;

export const getServerSideProps = async ({ params, req }) => {
  const { id } = params;
  const language = req.cookies?.languageSetting || "en";

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const configRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
      {
        method: "GET",
        headers: {
          "X-software-id": 33571750,
          "X-server": "server",
          "X-localization": language,
          origin: process.env.NEXT_CLIENT_HOST_URL,
        },
      },
    );
    const configData = configRes.ok ? await configRes.json() : null;

    let vehicleData = null;
    try {
      const vehicleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/rental/vehicle/get-vehicle-details/${id}`;

      const vehicleRes = await fetch(vehicleUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-software-id": 33571750,
          "X-localization": language,
          moduleId: "9", // ✅ Rental module id
          origin: process.env.NEXT_CLIENT_HOST_URL,
        },
      });

      // console.log("✅ Vehicle API status:", vehicleRes.status);
      const rawText = await vehicleRes.text();
      console.log("✅ Vehicle API response:", rawText);

      if (vehicleRes.ok) {
        vehicleData = JSON.parse(rawText);
      }
    } catch (vehicleError) {
      // console.error("❌ Vehicle fetch error:", vehicleError.message);
    }

    return {
      props: {
        configData: configData || null,
        vehicleData: vehicleData || null,
      },
    };
  } catch (error) {
    // console.error("getServerSideProps error:", error);
    return {
      props: {
        configData: null,
        vehicleData: null,
      },
    };
  }
};
