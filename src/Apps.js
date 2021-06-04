import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function Apps(props) {
  const [test, setTest] = useState('aaa')
  const { name } = props

  useEffect(() => {
    setTest(name)
  }, [name])

  return (
    <div>
      react apps sdafdeact apps sdafdeact apps sdafdeact apps sdafdeact apps sdafdeact apps
      sdafdeact apps sdafd
      {test}
    </div>
  )
}

Apps.propTypes = {
  name: PropTypes.string,
}

export default Apps
