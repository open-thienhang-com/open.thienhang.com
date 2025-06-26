import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardImage,
  CCardLink,
  CCardText,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CCol,
  CRow,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
} from '@coreui/icons'

import api, { directApi } from '../../api/axios'
import { useParams, useNavigate } from 'react-router-dom'

const Marketplace = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dataProduct, setDataProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDataProduct()
  }, [id])

  const fetchDataProduct = async (id) => {
    setLoading(true)
    setError(null)

    setLoading(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching dataProduct via proxy...')
        response = await api.get('/governance/assets')
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.get('/governance/assets')
      }

      console.log('✅ dataProduct API response:', response.data)

      if (response.data && response.data.data) {
        setDataProduct(response.data.data)
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('❌ Error fetching dataProduct:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch dataProduct')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
    <CRow>
        {
            loading ? (
              <div className="text-center">
                <CIcon icon={cilCloudDownload} size="xxl" spin />
                <p>Loading data products...</p>
              </div>
            ) : error ? (
              <div className="text-danger text-center">
                <p>Error: {error}</p>
                <CButton color="primary" onClick={() => fetchDataProduct()}>
                  Retry
                </CButton>
              </div>
            ) : (
              <CRow>
                  {dataProduct.map((product) => (
                    <CCol sm={4}>
                      <CCard className="mb-3" key={product.id}>
                        {/* <CCardImage orientation="top" src={withPrefix('/images/react.jpg')} /> */}
                        <CCardBody>
                          <CCardTitle>{product.id} {product.name}</CCardTitle>
                          <CCardText>
                          {product.description}
                          </CCardText>
                        </CCardBody>
                        <CListGroup flush>
                          <CListGroupItem>{product.category}</CListGroupItem>
                          <CListGroupItem>Status: {product.status}</CListGroupItem>
                          <CListGroupItem>{product.sensitivity}</CListGroupItem>
                        </CListGroup>
                        <CCardBody>
                          <CCardLink href="#">Card link</CCardLink>
                          <CCardLink href="#">Another link</CCardLink>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
              </CRow>
            )
          }
      </CRow>
    </>
  )
}

export default Marketplace
