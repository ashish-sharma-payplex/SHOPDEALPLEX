import { Skeleton, styled, Tooltip, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Stack } from "@mui/system";
import React, { useEffect, useState } from "react";
import { setSelectedModule } from "redux/slices/utils";
import CustomImageContainer from "../CustomImageContainer";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Travels from "src/components/landing-page/imgs/travels.png";
import Handyman from "src/components/landing-page/imgs/handyman.png";

const Container = styled(Box)(({ theme, isOpen }) => ({
  position: "fixed",
  zIndex: 1000,
  top: 150,
  right: 0,
  boxShadow: "0px 0px 29.7006px rgba(71, 71, 71, 0.1)",
  background: theme.palette.background.paper,
  borderTopLeftRadius: "29px",
  borderBottomLeftRadius: "29px",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  padding: ".8rem",
  transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.3s ease',
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const ToggleButton = styled(IconButton)(({ theme, isOpen }) => ({
  position: 'fixed',
  top: 'calc(150px + 100px)', // Position in the middle of the module select menu
  right: isOpen ? '230px' : 0,
  zIndex: 1001,
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: '29px',
  borderBottomLeftRadius: '29px',
  boxShadow: '0px 0px 29.7006px rgba(71, 71, 71, 0.1)',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const ModuleContainer = styled(Box)(({ theme, selected }) => ({
  zIndex: 1000,
  cursor: "pointer",
  width: "62px",
  height: "62px",
  minHeight: "62px",
  borderRadius: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(227, 227, 227, 0.2)",
  border: "2px solid rgb(252, 185, 41)",
  transition: "all ease 0.5s",
  borderColor: selected
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  background:
    selected &&
    "radial-gradient(50% 50% at 50% 50%, rgba(0, 202, 108, 0) 0%, rgba(0, 255, 137, 0.2) 100%)",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    background:
      "radial-gradient(50% 50% at 50% 50%, rgba(0, 202, 108, 0) 0%, rgba(255, 238, 0, 0.3) 100%)",
    "img, svg": {
      transform: "scale(1.1)",
    },
  },
}));

export const zoneWiseModule = (data) => {
  // Remove filtering based on localStorage zoneid to avoid dependency on localStorage
  return data;
};

const TRAVELS_EXTERNAL_LINK = "https://travelmytrip.com/flight/";
const HANDYMAN_EXTERNAL_LINK = "https://agent.dealplex.in/";
const travelsModule = {
  module_name: 'Travels',
  module_type: 'travels',
  icon_full_url: Travels.src,
  id: 'travels',
};
const handymanModule = {
  module_name: 'Handyman',
  module_type: 'handyman',
  icon_full_url: Handyman.src,
  id: 'handyman',
};

const ModuleSelect = ({
  moduleSelectHandler,
  selectedModule,
  data,
  dispatch,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { interestId, existingModuleId } = useSelector(
    (state) => state.categoryIds
  );
  const reduxDispatch = useDispatch();

  useEffect(() => {
    if (router.query.module && data) {
      const selected = data.find(
        (item) =>
          item.module_type === router.query.module ||
          item.id === router.query.module
      );
      if (selected) {
        reduxDispatch(setSelectedModule(selected));
        window.scrollTo(0, 0);
        sessionStorage.removeItem("scrollPosition");
      }
    }
  }, [router.query.module, data, reduxDispatch]);

  const handleModuleSelect = (item) => {
    dispatch(setSelectedModule(item));
    window.scrollTo(0, 0);
    sessionStorage.removeItem("scrollPosition");
    moduleSelectHandler(item);
    const isModuleExist = existingModuleId?.includes(item?.id);

    if (
      interestId?.length > 0 &&
      !isModuleExist &&
      item.module_type !== "parcel"
    ) {
      router.push("/interest", undefined, { shallow: true });
    }
  };

  const handleExternalLink = (moduleType) => {
    switch (moduleType) {
      case 'travels':
        window.open(TRAVELS_EXTERNAL_LINK, '_blank');
        break;
      case 'handyman':
        window.open(HANDYMAN_EXTERNAL_LINK, '_blank');
        break;
      default:
        break;
    }
  };

  const getAllModules = () => {
    const zoneModules = zoneWiseModule?.(data) || [];
    return [...zoneModules, travelsModule, handymanModule];
  };

  return (
    <>
      <ToggleButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close module menu" : "Open module menu"}
        size="small"
      >
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </ToggleButton>
      <Container p=".8rem" spacing={2} isOpen={isOpen}>
        {data ? (
          getAllModules().map((item, index) => {
            const isSelected =
              item?.module_type === selectedModule?.module_type &&
              item?.id === selectedModule?.id;

            const isExternalLink = ['travels', 'handyman'].includes(item.module_type);

            return (
              <Tooltip
                title={item?.module_name}
                key={index}
                placement="left-start"
              >
                <ModuleContainer
                  selected={isSelected}
                  onClick={() => {
                    if (isExternalLink) {
                      handleExternalLink(item.module_type);
                    } else {
                      handleModuleSelect(item);
                    }
                  }}
                >
                  <CustomImageContainer
                    src={item?.icon_full_url}
                    width="50px"
                    height="50px"
                    alt={item?.module_name}
                    objectFit="cover"
                  />
                </ModuleContainer>
              </Tooltip>
            );
          })
        ) : (
          <>
            {[...Array(5)].map((_, index) => (
              <Skeleton
                key={index}
                width="40px"
                height="40px"
                variant="rectangle"
              />
            ))}
          </>
        )}
      </Container>
    </>
  );
};

export default ModuleSelect;
