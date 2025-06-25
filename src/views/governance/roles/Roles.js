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
import api, { directApi } from '../../../api/axios'

const Roles = () => {
  const navigate = useNavigate()
  const [Roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [UserToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch Roles data
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching Roles via proxy...')
        response = await api.get('/governance/roles')
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.get('/governance/roles')
      }

      console.log('✅ Roles API response:', response.data)

      if (response.data && response.data.data) {
        setRoles(response.data.data)
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('❌ Error fetching Roles:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch Roles')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (User) => {
    setSelectedUser(User)
    setShowModal(true)
  }

  const handleNavigateToDetail = (UserId) => {
    navigate(`/Roles/${UserId}`)
  }

  const handleDeleteClick = (User) => {
    setUserToDelete(User)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!UserToDelete) return

    setDeleting(true)

    try {
      let response

      try {
        console.log('🗑️ Deleting User via proxy...', UserToDelete._id)
        response = await api.delete(`/services/User/apartment/apartment/${UserToDelete._id}`)
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.delete(
          `/governance/user/${UserToDelete._id}`,
        )
      }

      console.log('✅ User deleted successfully:', response.data)

      // Show success toast
      toast.success(response.data.message || `User "${UserToDelete.title}" deleted successfully!`)

      // Remove the deleted User from the list
      setRoles((prev) => prev.filter((User) => User._id !== UserToDelete._id))

      // Close modal and reset state
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('❌ Error deleting User:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to delete User "${UserToDelete.title}". Please try again.`

      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusBadge = (User) => {
    if (!User.is_active) return <CBadge color="secondary">Inactive</CBadge>
    if (User.is_booked) return <CBadge color="warning">Booked</CBadge>
    return <CBadge color="success">Available</CBadge>
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardBody className="text-center py-5">
              <CSpinner color="primary" variant="grow" />
              <div className="mt-3">Loading Roles...</div>
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
                  <CButton color="primary" size="sm" onClick={fetchRoles}>
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
                  <strong>🏨 Roles</strong>
                  <small className="ms-2">Total: {Roles.length} roles</small>
                </div>
                <div>
                  <CButton
                    color="success"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate('/user/create')}
                  >
                    Create User
                  </CButton>
                  <CButton color="primary" size="sm" onClick={fetchRoles}>
                    Refresh
                  </CButton>
                </div>
              </div>
            </CCardHeader>
            <CCardBody>
            {Roles.length === 0 ? (
            <CAlert color="info">No roles found.</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Permissions</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Roles.map((role) => (
                  <CTableRow key={role._id}>
                    <CTableDataCell>{role.role_name}</CTableDataCell>
                    <CTableDataCell>{role.role_description}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="secondary">{role.role_type}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {role.permission_id && role.permission_id.length > 0 ? (
                        role.permission_id.map((pid) => (
                          <CBadge key={pid} color="info" className="me-1">
                            #{pid}
                          </CBadge>
                        ))
                      ) : (
                        <CBadge color="light">None</CBadge>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-1 flex-wrap">
                        <CButton
                          color="primary"
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRole(role)}
                        >
                          View
                        </CButton>
                        <CButton
                          color="warning"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/role/${role._id}/edit`)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRole(role)}
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

      {/* User Details Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>🏨 User Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedUser && (
            <CRow>
              <CCol md={6}>
                <h5>{selectedUser.title}</h5>
                <p className="text-muted">{selectedUser.description}</p>

                <h6 className="mt-4">📍 Address</h6>
                <p>
                  {selectedUser.address?.street} {selectedUser.address?.house_number}
                  <br />
                  {selectedUser.address?.city}, {selectedUser.address?.country}
                </p>

                <h6 className="mt-3">📞 Contact</h6>
                <p>
                  <CIcon icon={cilPhone} className="me-2" />
                  {selectedUser.hotline || 'N/A'}
                  <br />
                  <CIcon icon={cilEnvelopeClosed} className="me-2" />
                  {selectedUser.email || 'N/A'}
                </p>
              </CCol>
              <CCol md={6}>
                <h6>🏢 Property Details</h6>
                <p>
                  <strong>Name:</strong> {selectedUser.property?.name}
                  <br />
                  <strong>Description:</strong> {selectedUser.property?.description}
                  <br />
                  <strong>Total Apartments:</strong> {selectedUser.property?.total_apartments}
                </p>

                <h6 className="mt-3">💰 Pricing & Details</h6>
                <p>
                  <strong>Price per day:</strong>{' '}
                  {formatCurrency(selectedUser.price_per_day, selectedUser.currency)}
                  <br />
                  <strong>Total area:</strong> {selectedUser.total_area}m²
                  <br />
                  <strong>Bedrooms:</strong> {selectedUser.bedrooms}
                  <br />
                  <strong>Bathrooms:</strong> {selectedUser.bathrooms}
                </p>

                <h6 className="mt-3">✨ Amenities</h6>
                <div className="d-flex flex-wrap gap-1">
                  {selectedUser.property?.has_pool && <CBadge color="info">Pool</CBadge>}
                  {selectedUser.property?.has_elevator && (
                    <CBadge color="secondary">Elevator</CBadge>
                  )}
                  {selectedUser.is_furnished && <CBadge color="primary">Furnished</CBadge>}
                  {selectedUser.is_garage && <CBadge color="success">Garage</CBadge>}
                  {selectedUser.amenities?.map(
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
          {UserToDelete && (
            <div>
              <p>Are you sure you want to delete this User?</p>
              <div className="bg-light p-3 rounded">
                <strong>{UserToDelete.title}</strong>
                <br />
                <small className="text-muted">ID: {UserToDelete._id}</small>
                {UserToDelete.address && (
                  <div className="mt-2">
                    <small>
                      📍 {UserToDelete.address.city}, {UserToDelete.address.country}
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
                Delete User
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Roles
