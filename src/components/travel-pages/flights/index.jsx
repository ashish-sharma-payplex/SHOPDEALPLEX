// pages\flights\index.jsx
import FlightSearch from 'components/travel-components/flight/FlightSearch'
import PopularRoutes from 'components/travel-components/flight/PopularRoutes'
import React from 'react'
import { useLocation } from 'react-router-dom'

const index = () => {
  const location = useLocation()
  const { fromCity, toCity } = location.state || {}

  return (
    <>
      <FlightSearch initialFrom={fromCity} initialTo={toCity} />

      <PopularRoutes />
    </>
  )
}

export default index