import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard, CCardBody, CCardHeader,
  CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CSpinner, CAlert, CBadge, CButton,
  CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle
} from '@coreui/react'
import { toast } from 'react-toastify'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import api, { directApi } from '../../../api/axios'

const Permissions = () => {
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPermission, setSelectedPermission] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await api.get('/governance/permissions')
      } catch {
        response = await directApi.get('/governance/permissions')
      }
      const data = response.data?.data
      if (Array.isArray(data)) setPermissions(data)
      else throw new Error('Invalid response format')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (permission) => {
    setSelectedPermission(permission)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPermission) return
    setDeleting(true)
    try {
      let response
      try {
        response = await api.delete(`/governance/permission/${selectedPermission._id}`)
      } catch {
        response = await directApi.delete(`/governance/permission/${selectedPermission._id}`)
      }
      toast.success(response.data.message || `Deleted: "${selectedPermission.name}"`)
      setPermissions(prev => prev.filter(a => a._id !== selectedPermission._id))
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const closeModal = () => {
    setShowDeleteModal(false)
    setSelectedPermission(null)
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
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <strong>🏨 Permissions</strong>
                <small className="ms-2">Total: {permissions.length}</small>
              </div>
              <div>
                <CButton
                  color="success"
                  size="sm"
                  className="me-2"
                  onClick={() => navigate('/governance/permission/create')}
                >
                  Create Permission
                </CButton>
                <CButton color="primary" size="sm" onClick={fetchPermissions}>
                  Refresh
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {permissions.length === 0 ? (
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
                    {permissions.map(permission => (
                      <CTableRow key={permission._id}>
                        <CTableDataCell>{permission.name}</CTableDataCell>
                        <CTableDataCell>{permission.code}</CTableDataCell>
                        <CTableDataCell>{permission.description}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1 flex-wrap">
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => navigate(`/governance/permission/${permission._id}`)}
                            >
                              Details
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(permission)}
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

      {/* Delete Modal */}
      <CModal visible={showDeleteModal} onClose={closeModal} size="sm">
        <CModalHeader>
          <CModalTitle>🗑️ Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedPermission && (
            <>
              <p>Are you sure you want to delete this permission?</p>
              <div className="bg-dark text-white p-3 rounded">
                <strong>{selectedPermission.name}</strong>
                <br />
                <small>ID: {selectedPermission._id}</small>
              </div>
              <CAlert color="warning" className="mt-3 mb-0">
                This action cannot be undone.
              </CAlert>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal} disabled={deleting}>
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
                Delete
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Permissions
