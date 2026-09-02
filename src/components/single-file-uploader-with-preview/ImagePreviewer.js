import React from "react";
import {
  FilePreviewerWrapper,
  CustomBoxForFilePreviewer,
  IconButtonImagePreviewer,
} from "../file-previewer/FilePreviewer.style";
import { InputLabel } from "@mui/material";
import Image from "next/image"; // ✅ Corrected import
import ImageUploaderThumbnail from "./ImageUploaderThumbnail";
import DeleteIcon from "@mui/icons-material/Delete";
import emptyImage from "../profile/asset/gallery-add.png";
import CustomImageContainer from "components/CustomImageContainer";

const ImagePreviewer = ({
  anchor,
  file,
  label,
  width,
  imageUrl,
  borderRadius,
  error,
  objectFit,
  height,
  hintText,
  marginLeft,
}) => {
  let previewImage;

  if (typeof file !== "string") {
    previewImage = {
      url: URL.createObjectURL(file),
    };
  } else previewImage = file;

  return (
    <>
      <CustomBoxForFilePreviewer>
        {previewImage ? (
          <FilePreviewerWrapper
            marginLeft={marginLeft}
            onClick={() => anchor.current.click()}
            width={width}
            objectFit={objectFit}
            borderRadius={borderRadius}
            height={height}
          >
            {typeof file !== "string" ? (
              <Image
                src={previewImage.url}
                alt="preview"
                width={500}
                height={130}
                style={{
                  width: "100%",
                  height: "130px",
                  objectFit: objectFit || "contain",
                  borderRadius: borderRadius,
                }}
              />
            ) : (
              <CustomImageContainer
                src={previewImage}
                width="100%"
                height="130px"
                objectfit="cover"
                borderRadius={borderRadius}
              />
            )}
          </FilePreviewerWrapper>
        ) : (
          <FilePreviewerWrapper
            marginLeft={marginLeft}
            onClick={() => anchor.current.click()}
            width={width}
            height={height}
            objectFit
            borderRadius={borderRadius}
          >
            <ImageUploaderThumbnail
              label={label}
              width={width}
              error={error}
              borderRadius={borderRadius}
            />
          </FilePreviewerWrapper>
        )}
      </CustomBoxForFilePreviewer>
    </>
  );
};

export default ImagePreviewer;
