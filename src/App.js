import React from 'react'
import svg from './svgs/logo.svg'
import PropTypes from 'prop-types'
import { Button } from 'antd'
function App(props) {
  return (
    <div>
      ls react app dsafds dsafdsa dsafdsaf dsafdsaf //
      <img src={svg} />
      {props.children}
      <Button type="primary">test</Button>
    </div>
  )
}

App.propTypes = {
  children: PropTypes.any,
}

export default App
