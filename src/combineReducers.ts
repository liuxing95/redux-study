import { 
  ActionFromReducersMapObject,
  Reducer,
  ReducersMapObject,
  StateFromReducersMapObject
} from './types/reducers'
import { CombinedState } from './types/store';
import { AnyAction, Action } from './types/actions'
import ActionTypes from './utils/actionTypes';

function getUndefinedStateErrorMessage(key: string, action: Action) {
  const actionType = action && action.type
  const actionDescription =
    (actionType && `action "${String(actionType)}"`) || 'an action'

  return (
    `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  )
}

function assertReducerShape(reducers: ReducersMapObject) {
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]

    const initialState = reducer(undefined, { type: ActionTypes.INIT })

    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      )
    }

    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined'
    ) {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}
/**
 * 转换 一个对象 当它的值全部都是 reducer functions 改成一个 单一的 reducer function
 * 它会调用每一个子 reducer 然后把他们的结果合成一个单一的state 对象
 */
export default function combineReducers<S>(
  reducers: ReducersMapObject<S, any>
): Reducer<CombinedState<S>>
export default function combineReducers<S, A extends Action = AnyAction>(
  reducers: ReducersMapObject<S, A>
): Reducer<CombinedState<S>, A>
export default function combineReducers<M extends ReducersMapObject>(
  reducers: M
): Reducer<
  CombinedState<StateFromReducersMapObject<M>>,
  ActionFromReducersMapObject<M>
>
export default function combineReducers(reducers: ReducersMapObject) {
  const reducerKeys = Object.keys(reducers)
  const finalReducers: ReducersMapObject = {}
  // finalReducers 包含 reducers 的值
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }

  const finalReducerKeys = Object.keys(finalReducers)

  // This is used to make sure we don't warn about the same
  // keys multiple times.
  // let unexpectedKeyCache: { [key: string]: true }
  let shapeAssertionError: Error

  try {
    assertReducerShape(finalReducers)
  } catch(e) {
    shapeAssertionError = e
  }

  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: AnyAction
  ) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    let hasChanged = false
    // 从定义上看 多个reducer 绑定到 一个reducer 函数
    // 这个合成的reducer 函数 从实现上看 是把之前你绑定的多个reducer 再次执行一遍进行重新赋值
    // 判读是否有更改过 有的话 返回 新的 nextState 否则 返回老的state
    const nextState: StateFromReducersMapObject<typeof reducers> = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }

    hasChanged =
        hasChanged || finalReducerKeys.length !== Object.keys(state).length

    return hasChanged ? nextState : state
  }
}