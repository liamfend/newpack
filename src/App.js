import React from 'react'
import svg from './svgs/logo.svg'
function App(props) {
    return (
        <div>
          react  app dsafds dsafdsa dsafdsaf dsafdsaf
         <img src ={ svg} />
          {props.children}
        </div>
    )
}

export default App
