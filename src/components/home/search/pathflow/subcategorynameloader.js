import React, { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Alert } from "@mui/material";
import MainApi from "../../../../api-manage/MainApi";
import { categories_Childes_api } from "../../../../api-manage/ApiRoutes";

const SubCategoryLoader = ({ catid, subid, module_id }) => {
  const [subCategoryName, setSubCategoryName] = useState("All");  // Default to "All"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const subcategorynameloader = async (catId, subId) => {
    try {
     

      setLoading(true);
      setError(null);

      const { data } = await MainApi.get(
        `${categories_Childes_api}/${catId}`,
        {
          headers: {
            moduleId: String(module_id),
          },
        }
      );


      if (!Array.isArray(data)) {
        // console.warn("⚠️ Unexpected API structure:", data);
        setError("Unexpected API response format");
        return;
      }

      const selectedSubCat = data.find(
        (item) => item.id === Number(subId)
      );


      // If subcategory is found, set its name, otherwise default to "All"
      if (selectedSubCat) {
        setSubCategoryName(selectedSubCat.name);
      } else {
        setSubCategoryName("All");  // Default to "All" if no subcategory found
      }
    } catch (err) {
      // console.error("❌ Subcategory fetch error:", err);
      setError("Failed to fetch subcategory.");
      setSubCategoryName("All");  // Default to "All" in case of error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (catid && subid && module_id) {
      subcategorynameloader(catid, subid);
    } else if (catid && !subid) {
      setSubCategoryName("All");  // If no subid, default to "All"
    }
  }, [catid, subid, module_id]);

  return (
    <Box>
      {loading && <CircularProgress size={22} />}

      {error && (
        <Alert severity="error" sx={{ mt: 0 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "black",
          }}
        >
          {subCategoryName}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(SubCategoryLoader);
