import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CBadge,
  CButton,
  CListGroup,
  CListGroupItem,
  CContainer,
  CButtonGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilLocationPin,
  cilPhone,
  cilEnvelopeClosed,
  cilHome,
  cilBath,
  cilUser,
  cilArrowLeft,
  cilStar,
  cilCheckCircle,
  cilXCircle,
  cilPool,
  cilBuilding,
  cilStorage,
  cilRoom,
  cilPencil,
} from '@coreui/icons'
import api, { directApi } from '../../../api/axios'

const HotelDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchHotelDetail(id)
    }
  }, [id])

  const fetchHotelDetail = async (hotelId) => {
    setLoading(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching hotel detail via proxy...', hotelId)
        response = await api.get(`/services/hotel/apartment/apartment/${hotelId}`)
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.get(`/services/hotel/apartment/apartment/${hotelId}`)
      }

      console.log('✅ Hotel detail API response:', response.data)

      if (response.data && response.data.data) {
        setHotel(response.data.data)
      } else {
        setError('Hotel not found')
      }
    } catch (err) {
      console.error('❌ Error fetching hotel detail:', err)
      if (err.response?.status === 404) {
        setError('Hotel not found')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch hotel details')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusBadge = (hotel) => {
    if (!hotel.is_active)
      return (
        <CBadge color="secondary" size="lg">
          Inactive
        </CBadge>
      )
    if (hotel.is_booked)
      return (
        <CBadge color="warning" size="lg">
          Booked
        </CBadge>
      )
    return (
      <CBadge color="success" size="lg">
        Available
      </CBadge>
    )
  }

  const handleBack = () => {
    navigate('/hotels')
  }

  if (loading) {
    return (
      <CContainer>
        <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardBody className="text-center py-5">
                <CSpinner color="primary" variant="grow" />
                <div className="mt-3">Loading hotel details...</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer>
        <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardBody>
                <CAlert color="danger">
                  <strong>Error:</strong> {error}
                  <div className="mt-3">
                    <CButtonGroup>
                      <CButton color="primary" size="sm" onClick={() => fetchHotelDetail(id)}>
                        Retry
                      </CButton>
                      <CButton color="secondary" size="sm" onClick={handleBack}>
                        Back to Hotels
                      </CButton>
                    </CButtonGroup>
                  </div>
                </CAlert>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  if (!hotel) {
    return (
      <CContainer>
        <CRow>
          <CCol xs={12}>
            <CAlert color="warning">Hotel not found</CAlert>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  return (
    <CContainer>
      {/* Header with Back Button */}
      <CRow className="mb-4">
        <CCol>
          <div className="d-flex justify-content-between align-items-center">
            <CButton color="primary" variant="outline" onClick={handleBack} className="mb-3">
              <CIcon icon={cilArrowLeft} className="me-2" />
              Back to Hotels
            </CButton>
            <CButton
              color="warning"
              variant="outline"
              onClick={() => navigate(`/hotels/${id}/edit`)}
              className="mb-3"
            >
              <CIcon icon={cilPencil} className="me-2" />
              Edit Hotel
            </CButton>
          </div>
        </CCol>
      </CRow>

      {/* Main Hotel Info */}
      <CRow>
        <CCol lg={8}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1">🏨 {hotel.title || 'Hotel Apartment'}</h4>
                  <small className="text-muted">ID: {hotel._id}</small>
                </div>
                <div>{getStatusBadge(hotel)}</div>
              </div>
            </CCardHeader>
            <CCardBody>
              <p className="text-muted mb-4">{hotel.description}</p>

              <CRow>
                <CCol md={6}>
                  <h6>📍 Address</h6>
                  <div className="d-flex align-items-start mb-3">
                    <CIcon icon={cilLocationPin} className="me-2 mt-1" />
                    <div>
                      {hotel.address?.street} {hotel.address?.house_number}
                      <br />
                      {hotel.address?.city}, {hotel.address?.country}
                      {hotel.address?.latitude && hotel.address?.longitude && (
                        <div className="text-muted small">
                          📍 {hotel.address.latitude}, {hotel.address.longitude}
                        </div>
                      )}
                    </div>
                  </div>

                  <h6>📞 Contact Information</h6>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <CIcon icon={cilPhone} className="me-2" />
                      <span>{hotel.hotline || 'Not available'}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilEnvelopeClosed} className="me-2" />
                      <span>{hotel.email || 'Not available'}</span>
                    </div>
                  </div>
                </CCol>

                <CCol md={6}>
                  <h6>🏠 Apartment Details</h6>
                  <CListGroup className="mb-3">
                    <CListGroupItem className="d-flex justify-content-between">
                      <span className="d-flex align-items-center">
                        <CIcon icon={cilHome} className="me-2" />
                        Bedrooms
                      </span>
                      <CBadge color="primary">{hotel.bedrooms || 0}</CBadge>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span className="d-flex align-items-center">
                        <CIcon icon={cilBath} className="me-2" />
                        Bathrooms
                      </span>
                      <CBadge color="primary">{hotel.bathrooms || 0}</CBadge>
                    </CListGroupItem>
                    <CListGroupItem className="d-flex justify-content-between">
                      <span className="d-flex align-items-center">
                        <CIcon icon={cilUser} className="me-2" />
                        Total Area
                      </span>
                      <CBadge color="info">{hotel.total_area || 0} m²</CBadge>
                    </CListGroupItem>
                  </CListGroup>

                  <h6>✨ Features</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <CBadge
                      color={hotel.is_furnished ? 'success' : 'secondary'}
                      className="d-flex align-items-center"
                    >
                      <CIcon
                        icon={hotel.is_furnished ? cilCheckCircle : cilXCircle}
                        className="me-1"
                        size="sm"
                      />
                      <CIcon icon={cilRoom} className="me-1" size="sm" />
                      Furnished
                    </CBadge>
                    <CBadge
                      color={hotel.is_garage ? 'success' : 'secondary'}
                      className="d-flex align-items-center"
                    >
                      <CIcon
                        icon={hotel.is_garage ? cilCheckCircle : cilXCircle}
                        className="me-1"
                        size="sm"
                      />
                      <CIcon icon={cilStorage} className="me-1" size="sm" />
                      Garage
                    </CBadge>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Sidebar with Price and Property Info */}
        <CCol lg={4}>
          {/* Pricing Card */}
          <CCard className="mb-4">
            <CCardHeader>
              <h5 className="mb-0">💰 Pricing</h5>
            </CCardHeader>
            <CCardBody className="text-center">
              <div className="display-6 text-success mb-2">
                {formatCurrency(hotel.price_per_day, hotel.currency)}
              </div>
              <div className="text-muted">per day</div>
              {hotel.is_booked ? (
                <CAlert color="warning" className="mt-3 mb-0">
                  Currently Booked
                </CAlert>
              ) : (
                <CButton color="success" size="lg" className="mt-3" disabled={!hotel.is_active}>
                  {hotel.is_active ? 'Book Now' : 'Not Available'}
                </CButton>
              )}
            </CCardBody>
          </CCard>

          {/* Property Info Card */}
          <CCard className="mb-4">
            <CCardHeader>
              <h5 className="mb-0">🏢 Property Information</h5>
            </CCardHeader>
            <CCardBody>
              <h6>{hotel.property?.name || 'Unknown Property'}</h6>
              <p className="text-muted small">{hotel.property?.description}</p>

              <div className="mb-3">
                <strong>Total Apartments:</strong> {hotel.property?.total_apartments || 0}
              </div>

              <h6>Property Features:</h6>
              <div className="d-flex flex-wrap gap-2">
                <CBadge
                  color={hotel.property?.has_pool ? 'info' : 'secondary'}
                  className="d-flex align-items-center"
                >
                  <CIcon
                    icon={hotel.property?.has_pool ? cilCheckCircle : cilXCircle}
                    className="me-1"
                    size="sm"
                  />
                  <CIcon icon={cilPool} className="me-1" size="sm" />
                  Swimming Pool
                </CBadge>
                <CBadge
                  color={hotel.property?.has_elevator ? 'secondary' : 'light'}
                  className="d-flex align-items-center"
                >
                  <CIcon
                    icon={hotel.property?.has_elevator ? cilCheckCircle : cilXCircle}
                    className="me-1"
                    size="sm"
                  />
                  <CIcon icon={cilBuilding} className="me-1" size="sm" />
                  Elevator
                </CBadge>
              </div>

              {hotel.property?.address && (
                <div className="mt-3">
                  <h6>Property Address:</h6>
                  <small className="text-muted">
                    {hotel.property.address.street} {hotel.property.address.house_number}
                    <br />
                    {hotel.property.address.city}, {hotel.property.address.country}
                  </small>
                </div>
              )}
            </CCardBody>
          </CCard>

          {/* Amenities Card */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <CCard>
              <CCardHeader>
                <h5 className="mb-0">🎯 Amenities</h5>
              </CCardHeader>
              <CCardBody>
                <CListGroup flush>
                  {hotel.amenities.map((amenity, index) => (
                    <CListGroupItem
                      key={index}
                      className="d-flex justify-content-between align-items-center px-0"
                    >
                      <div>
                        <strong>{amenity.name}</strong>
                        {amenity.description && (
                          <div className="text-muted small">{amenity.description}</div>
                        )}
                      </div>
                      <CBadge color={amenity.is_available ? 'success' : 'secondary'}>
                        <CIcon
                          icon={amenity.is_available ? cilCheckCircle : cilXCircle}
                          size="sm"
                        />
                      </CBadge>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default HotelDetail
