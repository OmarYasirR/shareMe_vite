import React, { useEffect } from 'react'
import { createContext, useReducer } from 'react'
import { verifyUser } from "../api";


export const UserContext = createContext()

export const userReducer = (state, action) => {
  switch(action.type){
    case 'LOGIN':
      localStorage.setItem('User', JSON.stringify(action.payload))
      return {
        user: action.payload,
        loading: false,
        error: null
      }
    case 'LOGOUT':
      localStorage.removeItem('User')
      return {
        user: null,
        loading: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    default: 
      return state
  }
}

export const UserContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    loading: true,
    error: null
  })
  
  useEffect(() => {
    if(!localStorage.getItem('User')){
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }
    
    const validateUser = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        const userData = localStorage.getItem('User')
        
        if (!userData) {
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }
        
        const user = JSON.parse(userData)
        console.log(user.token)
        console.log(user.token.length)
        console.log(typeof user.token)
        
        // Validate user with backend
        const response = await verifyUser(user.token)

        const result = await response.json()
        console.log(result)

        if (response.ok && result.success) {
          // User is valid, you might want to update with fresh user data
          const newUser = result.user
          newUser.token = user.token
          dispatch({ 
            type: 'LOGIN', 
            payload: newUser
          })
        } else {
          // User is invalid
          dispatch({ 
            type: 'SET_ERROR', 
            payload: result.message || 'Session expired' 
          })
          console.log('there is an error #############################3')
        }
        
      } catch (error) {
        console.error('Validation error:', error)
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Failed to validate user session' 
        })
        
      }
    }
  if(localStorage.getItem('User')){
    validateUser()
  }
  }, [])

  return (
    <UserContext.Provider value={{...state, dispatch}}>
      {children}
    </UserContext.Provider>
  )
}