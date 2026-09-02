import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MainApi from "../../../../api-manage/MainApi";
import {
  categories_Childes_api,
  categories_api,
  moduleList,
} from "../../../../api-manage/ApiRoutes";

const PathFlow = ({ catid, subid, module_id }) => {
  const router = useRouter();

  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [moduletype, setModuletype] = useState("");

  useEffect(() => {
    if (!catid || !module_id) {
      setCategoryName("");
      return;
    }

    let isMounted = true;

    const fetchCategoryName = async () => {
      try {
        const response = await MainApi.get(categories_api, {
          headers: { moduleId: String(module_id) },
        });

        // `/api/v1/categories` responds with `{ data: [...] }`
        const categoryList = response?.data?.data || response?.data || [];
        const matched = categoryList.find(
          (item) => Number(item.id) === Number(catid),
        );

        if (isMounted) setCategoryName(matched?.name || "");
      } catch (error) {
        // console.error("Category fetch error:", error);
        if (isMounted) setCategoryName("");
      }
    };

    fetchCategoryName();

    return () => {
      isMounted = false;
    };
  }, [catid, module_id]);

  useEffect(() => {
    if (!catid || !subid || subid === "all") {
      setSubCategoryName("");
      return;
    }

    let isMounted = true;

    const fetchSubCategory = async () => {
      try {
        const { data } = await MainApi.get(
          `${categories_Childes_api}/${catid}`,
          { headers: { moduleId: String(module_id) } },
        );

        const list = Array.isArray(data) ? data : [];
        const selectedSubCategory = list.find(
          (item) => Number(item.id) === Number(subid),
        );

        if (isMounted) setSubCategoryName(selectedSubCategory?.name || "");
      } catch (error) {
        // console.error("Subcategory fetch error:", error);
        if (isMounted) setSubCategoryName("");
      }
    };

    fetchSubCategory();

    return () => {
      isMounted = false;
    };
  }, [catid, subid, module_id]);

  /* ------------------------------------------------------------------
      ✅ Fetch Module Type (for Home link)
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!module_id) return;

    const fetchModuleType = async () => {
      try {
        const response = await MainApi.get(moduleList);
        const modules = response.data || [];

        const matchedModule = modules.find((module) => module.id == module_id);

        if (matchedModule) {
          setModuletype(matchedModule.module_type);
        } else {
          // console.error("Module not found");
        }
      } catch (error) {
        // console.error("Module api error:", error);
      }
    };

    fetchModuleType();
  }, [module_id]);

  /* ------------------------------------------------------------------
      ✅ Build Breadcrumb: Home > Category Name > Subcategory Name / All
  ------------------------------------------------------------------ */

  const breadcrumbData = useMemo(() => {
    const crumbs = [];

    if (catid) {
      crumbs.push({
        label: categoryName || "...",
        // href: `/category/${catid}`, // not-Clickable
      });

      crumbs.push({
        label: subCategoryName || "All",
        // No href -> Not clickable
      });
    }

    return crumbs;
  }, [catid, subid, categoryName, subCategoryName]);

  // const breadcrumbData = useMemo(() => {
  //   const crumbs = [];

  //   if (catid) {
  //     crumbs.push({
  //       label: categoryName || "...",
  //       href: `/category/${catid}`,
  //     });

  //     crumbs.push({
  //       label: subCategoryName || "All",
  //       href:
  //         subid && subid !== "all"
  //           ? `/category/${catid}?subcategory_id=${subid}`
  //           : `/category/${catid}`,
  //     });
  //   }

  //   return crumbs;
  // }, [catid, subid, categoryName, subCategoryName]);

  /* ------------------------------------------------------------------
      ✅ UI
  ------------------------------------------------------------------ */
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "20px",
        height: "3vh",
        width: "100%",
        marginLeft: "3%",
      }}
    >
      <Breadcrumbs separator=">" aria-label="breadcrumb">
        {/* Home */}
        <Link
          color="inherit"
          onClick={() => router.push(`/home?module=${moduletype}`)}
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} />
        </Link>

        {/* Dynamic Crumbs */}
        {breadcrumbData.map((item, index) => (
          <Link
            key={index}
            color="inherit"
            onClick={() => router.push(item.href)}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            {item.label}
          </Link>
        ))}
      </Breadcrumbs>
    </div>
  );
};

export default React.memo(PathFlow);
