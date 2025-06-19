import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert,
  CBadge,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { toast } from 'react-toastify'
import CIcon from '@coreui/icons-react'
import {
  cilLocationPin,
  cilPhone,
  cilEnvelopeClosed,
  cilHome,
  cilBath,
  cilUser,
  cilTrash,
} from '@coreui/icons'
import api from '../../api/axios'

const Hotels = () => {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [hotelToDelete, setHotelToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch hotels data
  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    setLoading(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching hotels via proxy...')
        response = await api.get('/services/hotel/apartment/apartments')
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await api.get('/services/hotel/apartment/apartments')
      }

      console.log('✅ Hotels API response:', response.data)

      if (response.data && response.data.data) {
        setHotels(response.data.data)
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('❌ Error fetching hotels:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch hotels')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel)
    setShowModal(true)
  }

  const handleNavigateToDetail = (hotelId) => {
    navigate(`/hotels/${hotelId}`)
  }

  const handleDeleteClick = (hotel) => {
    setHotelToDelete(hotel)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!hotelToDelete) return

    setDeleting(true)

    try {
      let response

      try {
        console.log('🗑️ Deleting hotel via proxy...', hotelToDelete._id)
        response = await api.delete(`/services/hotel/apartment/apartment/${hotelToDelete._id}`)
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await api.delete(`/services/hotel/apartment/apartment/${hotelToDelete._id}`)
      }

      console.log('✅ Hotel deleted successfully:', response.data)

      // Show success toast
      toast.success(response.data.message || `Hotel "${hotelToDelete.title}" deleted successfully!`)

      // Remove the deleted hotel from the list
      setHotels((prev) => prev.filter((hotel) => hotel._id !== hotelToDelete._id))

      // Close modal and reset state
      setShowDeleteModal(false)
      setHotelToDelete(null)
    } catch (error) {
      console.error('❌ Error deleting hotel:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to delete hotel "${hotelToDelete.title}". Please try again.`

      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setHotelToDelete(null)
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusBadge = (hotel) => {
    if (!hotel.is_active) return <CBadge color="secondary">Inactive</CBadge>
    if (hotel.is_booked) return <CBadge color="warning">Booked</CBadge>
    return <CBadge color="success">Available</CBadge>
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardBody className="text-center py-5">
              <CSpinner color="primary" variant="grow" />
              <div className="mt-3">Loading hotels...</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  if (error) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <CAlert color="danger">
                <strong>Error:</strong> {error}
                <div className="mt-2">
                  <CButton color="primary" size="sm" onClick={fetchHotels}>
                    Retry
                  </CButton>
                </div>
              </CAlert>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>🏨 Hotel Apartments</strong>
                  <small className="ms-2">Total: {hotels.length} apartments</small>
                </div>
                <div>
                  <CButton
                    color="success"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate('/hotels/create')}
                  >
                    Create Hotel
                  </CButton>
                  <CButton color="primary" size="sm" onClick={fetchHotels}>
                    Refresh
                  </CButton>
                </div>
              </div>
            </CCardHeader>
            <CCardBody>
              {hotels.length === 0 ? (
                <CAlert color="info">No apartments found.</CAlert>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Title</CTableHeaderCell>
                      <CTableHeaderCell>Property</CTableHeaderCell>
                      <CTableHeaderCell>Location</CTableHeaderCell>
                      <CTableHeaderCell>Price/Day</CTableHeaderCell>
                      <CTableHeaderCell>Details</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {hotels.map((hotel) => (
                      <CTableRow key={hotel._id}>
                        <CTableDataCell>
                          <div>
                            <strong>{hotel.title || 'N/A'}</strong>
                            {hotel.description && (
                              <div className="text-muted small">
                                {hotel.description.length > 50
                                  ? `${hotel.description.substring(0, 50)}...`
                                  : hotel.description}
                              </div>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{hotel.property?.name || 'Unknown Property'}</strong>
                            {hotel.property?.has_pool && (
                              <CBadge color="info" className="ms-1">
                                Pool
                              </CBadge>
                            )}
                            {hotel.property?.has_elevator && (
                              <CBadge color="secondary" className="ms-1">
                                Elevator
                              </CBadge>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CIcon icon={cilLocationPin} size="sm" className="me-1" />
                            <small>
                              {hotel.address?.city || 'Unknown'},{' '}
                              {hotel.address?.country || 'Unknown'}
                            </small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong className="text-success">
                            {formatCurrency(hotel.price_per_day, hotel.currency)}
                          </strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <span className="d-flex align-items-center">
                              <CIcon icon={cilHome} size="sm" className="me-1" />
                              {hotel.bedrooms || 0}
                            </span>
                            <span className="d-flex align-items-center">
                              <CIcon icon={cilBath} size="sm" className="me-1" />
                              {hotel.bathrooms || 0}
                            </span>
                            <span className="d-flex align-items-center">
                              <CIcon icon={cilUser} size="sm" className="me-1" />
                              {hotel.total_area || 0}m²
                            </span>
                          </div>
                          <div className="mt-1">
                            {hotel.is_furnished && (
                              <CBadge color="primary" className="me-1">
                                Furnished
                              </CBadge>
                            )}
                            {hotel.is_garage && (
                              <CBadge color="info" className="me-1">
                                Garage
                              </CBadge>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{getStatusBadge(hotel)}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1 flex-wrap">
                            <CButton
                              color="primary"
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(hotel)}
                            >
                              Quick View
                            </CButton>
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => handleNavigateToDetail(hotel._id)}
                            >
                              Details
                            </CButton>
                            <CButton
                              color="warning"
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/hotels/${hotel._id}/edit`)}
                            >
                              Edit
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(hotel)}
                            >
                              <CIcon icon={cilTrash} size="sm" />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Hotel Details Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>🏨 Hotel Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedHotel && (
            <CRow>
              <CCol md={6}>
                <h5>{selectedHotel.title}</h5>
                <p className="text-muted">{selectedHotel.description}</p>

                <h6 className="mt-4">📍 Address</h6>
                <p>
                  {selectedHotel.address?.street} {selectedHotel.address?.house_number}
                  <br />
                  {selectedHotel.address?.city}, {selectedHotel.address?.country}
                </p>

                <h6 className="mt-3">📞 Contact</h6>
                <p>
                  <CIcon icon={cilPhone} className="me-2" />
                  {selectedHotel.hotline || 'N/A'}
                  <br />
                  <CIcon icon={cilEnvelopeClosed} className="me-2" />
                  {selectedHotel.email || 'N/A'}
                </p>
              </CCol>
              <CCol md={6}>
                <h6>🏢 Property Details</h6>
                <p>
                  <strong>Name:</strong> {selectedHotel.property?.name}
                  <br />
                  <strong>Description:</strong> {selectedHotel.property?.description}
                  <br />
                  <strong>Total Apartments:</strong> {selectedHotel.property?.total_apartments}
                </p>

                <h6 className="mt-3">💰 Pricing & Details</h6>
                <p>
                  <strong>Price per day:</strong>{' '}
                  {formatCurrency(selectedHotel.price_per_day, selectedHotel.currency)}
                  <br />
                  <strong>Total area:</strong> {selectedHotel.total_area}m²
                  <br />
                  <strong>Bedrooms:</strong> {selectedHotel.bedrooms}
                  <br />
                  <strong>Bathrooms:</strong> {selectedHotel.bathrooms}
                </p>

                <h6 className="mt-3">✨ Amenities</h6>
                <div className="d-flex flex-wrap gap-1">
                  {selectedHotel.property?.has_pool && <CBadge color="info">Pool</CBadge>}
                  {selectedHotel.property?.has_elevator && (
                    <CBadge color="secondary">Elevator</CBadge>
                  )}
                  {selectedHotel.is_furnished && <CBadge color="primary">Furnished</CBadge>}
                  {selectedHotel.is_garage && <CBadge color="success">Garage</CBadge>}
                  {selectedHotel.amenities?.map(
                    (amenity, index) =>
                      amenity.is_available && (
                        <CBadge key={index} color="warning">
                          {amenity.name}
                        </CBadge>
                      ),
                  )}
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={showDeleteModal} onClose={handleDeleteCancel} size="sm">
        <CModalHeader>
          <CModalTitle>🗑️ Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {hotelToDelete && (
            <div>
              <p>Are you sure you want to delete this hotel?</p>
              <div className="bg-light p-3 rounded">
                <strong>{hotelToDelete.title}</strong>
                <br />
                <small className="text-muted">ID: {hotelToDelete._id}</small>
                {hotelToDelete.address && (
                  <div className="mt-2">
                    <small>
                      📍 {hotelToDelete.address.city}, {hotelToDelete.address.country}
                    </small>
                  </div>
                )}
              </div>
              <CAlert color="warning" className="mt-3 mb-0">
                <strong>Warning:</strong> This action cannot be undone!
              </CAlert>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <CIcon icon={cilTrash} className="me-2" />
                Delete Hotel
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Hotels
