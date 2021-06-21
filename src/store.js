import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger' // eslint-disable-line import/no-extraneous-dependencies
import thunk from 'redux-thunk'
import Immutable from 'immutable'
import reducer from '~client/reducers'

const middlewares = [thunk]

let enhancers = applyMiddleware(...middlewares)

const stateTransformer = state => {
  const newState = {}

  Object.keys(state).map(i => {
    if (Immutable.Iterable.isIterable(state[i])) {
      newState[i] = state[i].toJS()
    } else if (i === 'dashboard') {
      newState[i] = stateTransformer(state[i])
    } else {
      newState[i] = state[i]
    }

    return true
  })

  return newState
}

// eslint-disable-next-line jsx-control-statements/jsx-jcs-no-undef
if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger({
    stateTransformer,
  })

  middlewares.push(logger)

  const newEnhancers = applyMiddleware(...middlewares)
  /* eslint-disable no-underscore-dangle */
  enhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(newEnhancers)
    : newEnhancers
  /* eslint-enable */
}
const store = createStore(reducer, enhancers)

export default store
