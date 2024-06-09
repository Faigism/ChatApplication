import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'

const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [navigate])

  if (loading) {
    return <div className="loading"></div>
  }

  return element
}

export default ProtectedRoute
