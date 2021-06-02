import React, { Component, Suspense } from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// const App = React.lazy(() => import('./App'))
const Apps = React.lazy(() => import('./Apps'))

ReactDOM.render(<App>
    <Suspense fallback={<div>loading</div>}><Apps /> </Suspense>

</App>, document.getElementById('root'))
