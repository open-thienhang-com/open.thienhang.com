/**
 * Test API connection utility
 */

// Test direct fetch without axios
export const testDirectFetch = async () => {
  try {
    const response = await fetch('https://api.thienhang.com/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'duy@thienhang.com',
        password: 'stringst',
      }),
    })

    console.log('Direct fetch response:', response.status, response.statusText)
    const data = await response.json()
    console.log('Direct fetch data:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Direct fetch error:', error)
    return { success: false, error: error.message }
  }
}

// Test with different CORS modes
export const testCorsMode = async (mode = 'cors') => {
  try {
    const response = await fetch('https://api.thienhang.com/authentication/login', {
      method: 'POST',
      mode: mode, // 'cors', 'no-cors', 'same-origin'
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'duy@thienhang.com',
        password: 'stringst',
      }),
    })

    console.log(`CORS mode ${mode} response:`, response.status, response.statusText)
    if (mode !== 'no-cors') {
      const data = await response.json()
      console.log(`CORS mode ${mode} data:`, data)
      return { success: true, data }
    }
    return { success: true, message: 'no-cors mode - no data available' }
  } catch (error) {
    console.error(`CORS mode ${mode} error:`, error)
    return { success: false, error: error.message }
  }
}

// Test OPTIONS request
export const testPreflight = async () => {
  try {
    const response = await fetch('https://api.thienhang.com/authentication/login', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    })

    console.log('Preflight response:', response.status, response.statusText)
    console.log('Preflight headers:', Object.fromEntries(response.headers.entries()))
    return { success: response.ok, status: response.status }
  } catch (error) {
    console.error('Preflight error:', error)
    return { success: false, error: error.message }
  }
}

// Test all methods
export const runAllTests = async () => {
  console.log('🧪 Starting API connection tests...')

  console.log('\n1. Testing preflight request...')
  await testPreflight()

  console.log('\n2. Testing direct fetch...')
  await testDirectFetch()

  console.log('\n3. Testing CORS mode: cors...')
  await testCorsMode('cors')

  console.log('\n4. Testing CORS mode: no-cors...')
  await testCorsMode('no-cors')

  console.log('\n✅ All tests completed! Check console for details.')
}

// Add to window for easy access in dev tools
if (typeof window !== 'undefined') {
  window.testApi = {
    testDirectFetch,
    testCorsMode,
    testPreflight,
    runAllTests,
  }
}
