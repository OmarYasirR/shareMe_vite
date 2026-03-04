import { useContext } from "react"
import { PinsContext } from "../context/PinContext"


export const usePinsContext = () => {
  const context = useContext(PinsContext)

  if(!context){
    throw Error('use PinsContext must be used inside PinsContextProvider')
  }
  return context
}