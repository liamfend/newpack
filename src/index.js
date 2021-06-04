import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './scss/index.scss'

// const App = React.lazy(() => import('./App'))
//const Apps = React.lazy(() => import('./Apps'))

ReactDOM.render(
  <App>
    <Suspense fallback={<div>loading</div>}>
      {' '}
      <div>adfsd</div>{' '}
    </Suspense>
  </App>,
  document.getElementById('root'),
)

//document.getElementById('root').innerHTML = 'initail html'
