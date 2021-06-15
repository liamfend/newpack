import { useState, useCallback } from 'react'
import axios from 'axios'
import { debounce, get } from 'lodash'
import endpoints from '~settings/endpoints'
import * as queries from '~actions/reconciliation/queries'
import { getHeader } from '~helpers'

const useSearchCmsUser = () => {
  const [isAlreadySearched, setIsAlreadySearched] = useState(false)
  const [isFetchingCmsUser, setIsFetchingCmsUser] = useState(false)
  const [searchedCmsUsers, setSearchedCmsUsers] = useState([])

  const debounceSearch = useCallback(
    debounce(searchedUser => {
      if (searchedUser) {
        setIsFetchingCmsUser(true)

        axios({
          method: 'post',
          url: endpoints.defaultUrl.url(),
          data: queries.searchCmsUser({
            pageNumber: 1,
            pageSize: 10,
            searchName: searchedUser,
          }),
          headers: getHeader(),
        })
          .then(response => {
            const searched = get(response, ['data', 'data', 'cmsUsers', 'edges'])
            setSearchedCmsUsers(searched.map(cmsUser => cmsUser.node))
          })
          .finally(() => {
            setIsFetchingCmsUser(false)
            setIsAlreadySearched(true)
          })
      }
    }, 500),
    [],
  )

  const handleSearchCmsUser = useCallback(searchedUser => {
    if (searchedUser) {
      debounceSearch(searchedUser)
    } else {
      setIsAlreadySearched(false)
    }
  }, [])

  return {
    handleSearchCmsUser,
    isFetchingCmsUser,
    searchedCmsUsers,
    isAlreadySearched,
  }
}

export default useSearchCmsUser
