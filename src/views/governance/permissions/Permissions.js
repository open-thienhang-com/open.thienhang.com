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

const Permissions = () => {
  const navigate = useNavigate()
  const [Permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [UserToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch Permissions data
  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    setLoading(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching Permissions via proxy...')
        response = await api.get('/governance/permissions')
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.get('/governance/permissions')
      }

      console.log('✅ Permissions API response:', response.data)

      if (response.data && response.data.data) {
        setPermissions(response.data.data)
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('❌ Error fetching Permissions:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch Permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (User) => {
    setSelectedUser(User)
    setShowModal(true)
  }

  const handleNavigateToDetail = (UserId) => {
    navigate(`/Permissions/${UserId}`)
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
      setPermissions((prev) => prev.filter((User) => User._id !== UserToDelete._id))

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
              <div className="mt-3">Loading Permissions...</div>
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
                  <CButton color="primary" size="sm" onClick={fetchPermissions}>
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
              <strong>🔐 Permissions</strong>
              <small className="ms-2">Total: {Permissions.length} permission(s)</small>
            </div>
            <div>
              <CButton
                color="success"
                size="sm"
                className="me-2"
                onClick={() => navigate('/permission/create')}
              >
                Create Permission
              </CButton>
              <CButton color="primary" size="sm" onClick={fetchPermissions}>
                Refresh
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          {Permissions.length === 0 ? (
            <CAlert color="info">No permissions found.</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Permissions.map((permission) => (
                  <CTableRow key={permission._id}>
                    <CTableDataCell>{permission.name}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="secondary">{permission.code}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{permission.description}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-1 flex-wrap">
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPermission(permission)}
                        >
                          View
                        </CButton>
                        <CButton
                          color="warning"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/permission/${permission._id}/edit`)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePermission(permission)}
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
</>

  )
}

export default Permissions
