import { useTheme } from '@mui/material'
import React from 'react'

const CopyCodeIcon = () => {
  const theme = useTheme()

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back box */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        fill="none"
        stroke={theme.palette.success.main}
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Front box */}
      <rect
        x="7"
        y="7"
        width="18"
        height="18"
        rx="4"
        fill="none"
        stroke={theme.palette.success.main}
        strokeWidth="2"
      />
    </svg>
  )
}

export default CopyCodeIcon
