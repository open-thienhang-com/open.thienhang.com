# Authentication Wrapper Examples

## 1. Using ProtectedRoute Component

```jsx
import ProtectedRoute from '../components/ProtectedRoute'

// Wrap any component that requires authentication
;<Routes>
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

## 2. Using withAuth HOC

```jsx
import withAuth from '../hoc/withAuth'
import UserProfile from './UserProfile'

// Basic authentication
const ProtectedUserProfile = withAuth(UserProfile)

// With role-based access
const AdminUserProfile = withAuth(UserProfile, {
  allowedRoles: ['admin', 'super_admin'],
  redirectTo: '/unauthorized'
})

// Usage
<Route path="/profile" element={<ProtectedUserProfile />} />
<Route path="/admin/profile" element={<AdminUserProfile />} />
```

## 3. Using RoleGuard Component

```jsx
import RoleGuard from '../components/RoleGuard'
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  return (
    <div>
      <h1>Public Content</h1>

      <RoleGuard allowedRoles={['admin']}>
        <button>Admin Only Button</button>
      </RoleGuard>

      <RoleGuard allowedRoles={['user', 'admin']} redirectTo="alert">
        <p>This content is for users and admins</p>
      </RoleGuard>
    </div>
  )
}
```

## 4. Using AuthContext Hooks

```jsx
import { useAuth } from '../contexts/AuthContext'

function LoginForm() {
  const { login, logout, isAuthenticated, user, error } = useAuth()

  const handleLogin = async (email, password) => {
    const result = await login(email, password)
    if (result.success) {
      console.log('Login successful!')
    }
  }

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.email}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      {/* Login form fields */}
    </form>
  )
}
```

## 5. Using Auth Utilities

```jsx
import { isAuthenticated, getCurrentUser, hasRole, authenticatedFetch } from '../utils/auth'

// Check authentication status
if (isAuthenticated()) {
  console.log('User is logged in')
}

// Get current user
const user = getCurrentUser()
console.log('Current user:', user)

// Check user role
if (hasRole(user?.roles, 'admin')) {
  console.log('User is admin')
}

// Make authenticated API requests
const fetchUserData = async () => {
  try {
    const response = await authenticatedFetch('/api/user/profile')
    const userData = await response.json()
    return userData
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }
}
```

## 6. Protecting Entire Layout

```jsx
// In App.js
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes */}
  <Route
    path="/*"
    element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }
  />
</Routes>
```

## 7. Conditional Rendering Based on Auth

```jsx
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const { isAuthenticated, user } = useAuth()

  return (
    <nav>
      <Link to="/">Home</Link>

      {isAuthenticated ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile ({user?.email})</Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}
```

## Authentication Flow

1. **App Initialization**: AuthProvider checks for existing token and validates it
2. **Route Protection**: ProtectedRoute/withAuth checks authentication status
3. **Login Process**: User submits credentials → API call → Store tokens → Update context
4. **Token Refresh**: Automatic token refresh on API calls when token expires
5. **Logout**: Clear tokens → Update context → Redirect to login

## Security Best Practices

1. **Always validate tokens on the server side**
2. **Use HTTPS in production**
3. **Implement proper CORS policies**
4. **Store sensitive data server-side, not in JWT payload**
5. **Implement rate limiting for login attempts**
6. **Use secure, httpOnly cookies for tokens when possible**
