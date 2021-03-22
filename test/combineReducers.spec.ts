import {
  createStore,
  combineReducers,
  Reducer,
  AnyAction,
  // ActionTypes,
} from '../src/index'

describe('Utils', () => {
  describe('combineReducers', () => {
    it('returns a composite reducer that maps the state keys to given reducers', () => {
      const reducer = combineReducers({
        counter: (state: number = 0, action) => 
          action.type === 'increment' ? state + 1 : state,
        stack: (state: any[] = [], action) =>
          action.type === 'push' ? [...state, action.value] : state
      })
      const s1 = reducer(undefined, { type: 'increment' })
      expect(s1).toEqual({ counter: 1, stack: [] })
      const s2 = reducer(s1, { type: 'push', value: 'a' })
      expect(s2).toEqual({ counter: 1, stack: ['a'] })
    })
  })

  // 非 function的 reducer 直接被忽略
  it('ignores all props which are not a function', () => {
    const reducer = combineReducers({
      fake: (true as unknown) as Reducer,
      broken: ('string' as unknown) as Reducer,
      another: ({ nested: 'object' } as unknown) as Reducer,
      stack: (state = []) => state
    })

    expect(Object.keys(reducer(undefined, { type: 'push' }))).toEqual([
      'stack'
    ])
  })

  it('throws an error on first call if a reducer returns undefined initializing', () => {
    const reducer = combineReducers({
      counter(state: number, action) {
        switch (action.type) {
          case 'increment':
            return state + 1
          case 'decrement':
            return state - 1
          default:
            return state
        }
      }
    })
    expect(() => reducer(undefined, { type: 'increment' })).toThrow(
      /"counter".*initialization/
    )
  })

  it('allows a symbol to be used as an action type', () => {
    const increment = Symbol('INCREMENT')

    const reducer = combineReducers({
      counter(state: number = 0, action) {
        switch (action.type) {
          case increment:
            return state + 1
          default:
            return state
        }
      }
    })

    expect(reducer({ counter: 0 }, { type: increment }).counter).toEqual(1)
  })
})