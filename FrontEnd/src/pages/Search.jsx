import React from 'react'
import { useLocation, useNavigate  } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch.js'
import PinsMasonry from '../components/PinsMasonry.jsx'
import Loading from '../components/Loader.jsx'


const Search = () => {

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('searchQuery');
  
  // const useQuery = () => {
  //   return new SearchParams(useLocation().search)
  // }
  
  // const query = useQuery()
  // const searchQuery = query
  const navigator = useNavigate()
  
  
  const { data, error, loading } = useSearch(searchQuery)
  
  if (!searchQuery) return navigator('/')
  
  if(loading) return <Loading message={`searching for ${searchQuery}...`} />
  if(!data.length) return <div>
      <h2 className='flex flex-center mt-6 text-center'>
        No Result for {searchQuery}</h2>
    </div>
  
  return (
    <div className='pt-4'>
      <PinsMasonry pins={data} />
    </div>
  )
}

export default Search