// hooks/useGetPins.js - Nuclear option
import { useState, useEffect, useCallback } from "react"
import { getPins } from "../api"

export const useGetPins = () => {
  const [state, setState] = useState({
    error: null,
    loading: true,
    pins: []
  })

  const getData = useCallback(async () => {    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const pinsData = await getPins()
      setState({ error: null, loading: false, pins: pinsData })      
    } catch (error) {
      setState(prev => ({ ...prev, error, loading: false }))
        }
  }, [])

  useEffect(() => {
    getData()
  }, [getData])

  return { 
    error: state.error, 
    loading: state.loading, 
    pins: state.pins, 
    getData 
  }
}