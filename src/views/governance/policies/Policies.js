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

const Policies = () => {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await api.get('/governance/policies')
      } catch {
        response = await directApi.get('/governance/policies')
      }
      const data = response.data?.data
      if (Array.isArray(data)) setPolicies(data)
      else throw new Error('Invalid response format')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch policies')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (policy) => {
    setSelectedPolicy(policy)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPolicy) return
    setDeleting(true)
    try {
      let response
      try {
        response = await api.delete(`/governance/policy/${selectedPolicy._id}`)
      } catch {
        response = await directApi.delete(`/governance/policy/${selectedPolicy._id}`)
      }
      toast.success(response.data.message || `Deleted: "${selectedPolicy.name}"`)
      setPolicies(prev => prev.filter(a => a._id !== selectedPolicy._id))
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const closeModal = () => {
    setShowDeleteModal(false)
    setSelectedPolicy(null)
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardBody className="text-center py-5">
              <CSpinner color="primary" variant="grow" />
              <div className="mt-3">Loading Policies...</div>
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
                  <CButton color="primary" size="sm" onClick={fetchPolicies}>
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
                <strong>🏨 Policies</strong>
                <small className="ms-2">Total: {policies.length}</small>
              </div>
              <div>
                <CButton
                  color="success"
                  size="sm"
                  className="me-2"
                  onClick={() => navigate('/governance/policy/create')}
                >
                  Create Policy
                </CButton>
                <CButton color="primary" size="sm" onClick={fetchPolicies}>
                  Refresh
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {policies.length === 0 ? (
                <CAlert color="info">No policies found.</CAlert>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Assets</CTableHeaderCell>
                      <CTableHeaderCell>Role ID</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {policies.map(policy => (
                      <CTableRow key={policy._id}>
                        <CTableDataCell>{policy.name}</CTableDataCell>
                        <CTableDataCell>{policy.description}</CTableDataCell>
                        <CTableDataCell>{policy.type}</CTableDataCell>
                        <CTableDataCell>{policy.assets.join(', ')}</CTableDataCell>
                        <CTableDataCell>{policy.roles}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1 flex-wrap">
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => navigate(`/governance/policy/${policy._id}`)}
                            >
                              Details
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(policy)}
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
          {selectedPolicy && (
            <>
              <p>Are you sure you want to delete this policy?</p>
              <div className="bg-dark text-white p-3 rounded">
                <strong>{selectedPolicy.name}</strong>
                <br />
                <small>ID: {selectedPolicy._id}</small>
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

export default Policies
