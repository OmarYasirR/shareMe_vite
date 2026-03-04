import React from 'react'
import { useUserContext } from '../hooks/useUserContext'

const Profile = () => {
  const {user} = useUserContext()
  
  return (
    <div>
      <h1>hi there</h1>
    </div>
  )
}

export default Profile