import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://open.thienhang.com" target="_blank" rel="noopener noreferrer">
          Open Mesh
        </a>
        <span className="ms-1">&copy; 2025 thienhang.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
