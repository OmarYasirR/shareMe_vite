import { useState } from "react"
import { searchPin } from "../api"



export const useSearch = async (query) => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  let data

  try {
    setLoading(true)
    setError(null)
    data = await searchPin(query)
    setLoading(false)
  } catch (error) {
    setLoading(false)
    setError(error)
  }

return {data, loading, error}
}