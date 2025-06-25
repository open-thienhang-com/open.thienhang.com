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

const Assets = () => {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await api.get('/governance/assets')
      } catch {
        response = await directApi.get('/governance/assets')
      }
      const data = response.data?.data
      if (Array.isArray(data)) setAssets(data)
      else throw new Error('Invalid response format')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch assets')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (asset) => {
    setSelectedAsset(asset)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAsset) return
    setDeleting(true)
    try {
      let response
      try {
        response = await api.delete(`/governance/asset/${selectedAsset._id}`)
      } catch {
        response = await directApi.delete(`/governance/asset/${selectedAsset._id}`)
      }
      toast.success(response.data.message || `Deleted: "${selectedAsset.name}"`)
      setAssets(prev => prev.filter(a => a._id !== selectedAsset._id))
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const closeModal = () => {
    setShowDeleteModal(false)
    setSelectedAsset(null)
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardBody className="text-center py-5">
              <CSpinner color="primary" variant="grow" />
              <div className="mt-3">Loading Assets...</div>
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
                  <CButton color="primary" size="sm" onClick={fetchAssets}>
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
                <strong>🏨 Assets</strong>
                <small className="ms-2">Total: {assets.length}</small>
              </div>
              <div>
                <CButton
                  color="success"
                  size="sm"
                  className="me-2"
                  onClick={() => navigate('/governance/asset/create')}
                >
                  Create Asset
                </CButton>
                <CButton color="primary" size="sm" onClick={fetchAssets}>
                  Refresh
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {assets.length === 0 ? (
                <CAlert color="info">No assets found.</CAlert>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Source</CTableHeaderCell>
                      <CTableHeaderCell>Location</CTableHeaderCell>
                      <CTableHeaderCell>Owner</CTableHeaderCell>
                      <CTableHeaderCell>Sensitivity</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {assets.map(asset => (
                      <CTableRow key={asset._id}>
                        <CTableDataCell>{asset.name}</CTableDataCell>
                        <CTableDataCell>{asset.type}</CTableDataCell>
                        <CTableDataCell>{asset.source}</CTableDataCell>
                        <CTableDataCell>{asset.location}</CTableDataCell>
                        <CTableDataCell>{asset.owner}</CTableDataCell>
                        <CTableDataCell>{asset.sensitivity}</CTableDataCell>
                        <CTableDataCell>{asset.description}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1 flex-wrap">
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => navigate(`/governance/asset/${asset._id}`)}
                            >
                              Details
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(asset)}
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
          {selectedAsset && (
            <>
              <p>Are you sure you want to delete this asset?</p>
              <div className="bg-dark text-white p-3 rounded">
                <strong>{selectedAsset.name}</strong>
                <br />
                <small>ID: {selectedAsset._id}</small>
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

export default Assets
