import createStore from './createStore'
import combineReducers from './combineReducers'
import applyMiddleware from './applyMiddleware'


// types
// store
export {
  CombinedState,
  PreloadedState,
  Dispatch,
  // Unsubscribe,
  // Observable,
  // Observer,
  Store,
  // StoreCreator,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
  ExtendState
} from './types/store'

// reducers
export {
  Reducer,
  // ReducerFromReducersMapObject,
  // ReducersMapObject,
  // StateFromReducersMapObject,
  // ActionFromReducer,
  // ActionFromReducersMapObject
} from './types/reducers'

//middleware
export {
  Middleware,
  MiddlewareAPI
} from './types/middleware'

// actions
export { Action, AnyAction } from './types/actions'

export {
  createStore,
  combineReducers,
  applyMiddleware
}
