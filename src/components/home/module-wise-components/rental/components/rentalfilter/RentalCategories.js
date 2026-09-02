import { Box } from "@mui/material";
import CustomCheckbox from "components/CustomCheckbox";
import { Scrollbar } from "components/srollbar";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Skeleton from "@mui/material/Skeleton";

const RentalCategories = ({
  setSelectedCategoryIds,
  selectedCategoryIds = [],
}) => {

  // ✅ Redux se categories
  const { rentalCategories = [] } = useSelector(
    (state) => state?.rentalCategoriesLists || {}
  );

  // ✅ loading state (UI ke liye)
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FIXED HANDLE FUNCTION (IMPORTANT)
  const handleCheckChange = ({ checked, id }) => {
    let updated = [...selectedCategoryIds];

    if (checked) {
      // add
      if (!updated.includes(id)) {
        updated.push(id);
      }
    } else {
      // remove
      updated = updated.filter((itemId) => itemId !== id);
    }

    // ✅ parent ko direct array bhejna (NO callback)
    setSelectedCategoryIds(updated);
  };

  // ✅ fake loading (same as tera)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  // ✅ LOADING UI
  if (isLoading) {
    return (
      <Scrollbar style={{ maxHeight: "330px" }} scrollbarMinSize={1}>
        <Box sx={{ display: "flex", flexDirection: "column", mx: 1 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} sx={{ marginBottom: 2 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Skeleton variant="text" width="40%" />
            </Box>
          ))}
        </Box>
      </Scrollbar>
    );
  }

  // ✅ MAIN UI
  return (
    <Scrollbar style={{ maxHeight: "330px" }} scrollbarMinSize={1}>
      <Box sx={{ display: "flex", flexDirection: "column", mx: 1 }}>
        {rentalCategories.map((item) => (
          <CustomCheckbox
            key={item?.id}
            item={item}
            checkHandler={handleCheckChange}
            isChecked={selectedCategoryIds
              .map(String)
              .includes(String(item?.id))}
          />
        ))}
      </Box>
    </Scrollbar>
  );
};

export default RentalCategories;