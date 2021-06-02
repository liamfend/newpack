import React from 'react'
import logImg from './svgs/logo.svg'
function App(props) {
    return (
        <div>
          react  app dsafds dsafdsa dsafdsaf dsafdsaf
          <img src={logImg} />
          {props.children}
        </div>
    )
}

export default App
