import {useUserContext} from '../hooks/useUserContext'
import { signInUser } from '../api'
import { useState } from 'react'



export const useSignIn = async (usr) => {

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const {dispatch} = useUserContext()

  try {
    setLoading(true)
    setError(null)
    const res = await signInUser(usr)
    localStorage.setItem('User', res)
    dispatch({type: 'LOGIN', payload: res.user})
    setLoading(false)
  } catch (error) {
    setLoading(false)
    setError(error)
  }
  return {loading, error}
}