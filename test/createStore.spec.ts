import {
  createStore,
  Reducer,
} from '../src/index'

import {
  addTodo,
  dispatchInMiddle,
  getStateInMiddle,
  subscribeInMiddle,
  unsubscribeInMiddle,
  throwError,
  unknownAction
} from './helpers/actionCreators'

import * as reducers from './helpers/reducers'
import $$observable from '../src/utils/symbol-observable'

// 测试 createStore
describe('createStore', () => {
  // 测试 createStore 返回的几个api
  it('exposes the public API', () => {
    const store = createStore(reducers.todos)

    // Since switching to internal Symbol.observable impl, it will show up as a key in node env
    // So we filter it out
    const methods = Object.keys(store).filter(key => key !== $$observable)

    expect(methods.length).toBe(4)
    expect(methods).toContain('subscribe')
    expect(methods).toContain('dispatch')
    expect(methods).toContain('getState')
    expect(methods).toContain('replaceReducer')
  })

  // 测试 reducer 不是 function 会报错
  it('throws if reducer is not a function', () => {
    expect(() => createStore(undefined)).toThrow()

    expect(() => createStore(('test' as unknown) as Reducer)).toThrow()

    expect(() => createStore(({} as unknown) as Reducer)).toThrow()

    expect(() => createStore(() => {})).not.toThrow()
  })

  // 测试 基本数据
  it('passes the initial state', () => {
    const store = createStore(reducers.todos, [
      {
        id: 1,
        text: 'Hello'
      }
    ])

    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  // 测试触发 dispatch 修改 reducer
  it('applies the reducer to the previous state', () => {
    const store = createStore(reducers.todos)
    expect(store.getState()).toEqual([])

    store.dispatch(unknownAction())
    expect(store.getState()).toEqual([])

    store.dispatch(addTodo('Hello'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodo('World'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])
  })

  it('applies the reducer to the initial state', () => {
    const store = createStore(reducers.todos, [
      {
        id: 1,
        text: 'Hello'
      }
    ])
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(unknownAction())
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodo('World'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])
  })

  // replaceReducer 测试
  it('preserves the state when replacing a reducer', () => {
    const store = createStore(reducers.todos)
    store.dispatch(addTodo('Hello'))
    store.dispatch(addTodo('World'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])
    store.replaceReducer(reducers.todosReverse)

    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    store.dispatch(addTodo('Perhaps'))
    expect(store.getState()).toEqual([
      {
        id: 3,
        text: 'Perhaps'
      },
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    store.replaceReducer(reducers.todos)
    expect(store.getState()).toEqual([
      {
        id: 3,
        text: 'Perhaps'
      },
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    store.dispatch(addTodo('Surely'))
    expect(store.getState()).toEqual([
      {
        id: 3,
        text: 'Perhaps'
      },
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      },
      {
        id: 4,
        text: 'Surely'
      }
    ])
  })

  // 支持挂载多个监听
  it('supports multiple subscriptions', () => {
    const store = createStore(reducers.todos)
    const listenerA = jest.fn()
    const listenerB = jest.fn()

    let unsubscribeA = store.subscribe(listenerA)
    store.dispatch(unknownAction())
    expect(listenerA.mock.calls.length).toBe(1)
    expect(listenerB.mock.calls.length).toBe(0)

    store.dispatch(unknownAction())
    expect(listenerA.mock.calls.length).toBe(2)
    expect(listenerB.mock.calls.length).toBe(0)

    const unsubscribeB = store.subscribe(listenerB)
    expect(listenerA.mock.calls.length).toBe(2)
    expect(listenerB.mock.calls.length).toBe(0)

    store.dispatch(unknownAction())
    expect(listenerA.mock.calls.length).toBe(3)
    expect(listenerB.mock.calls.length).toBe(1)

    unsubscribeA()
    expect(listenerA.mock.calls.length).toBe(3)
    expect(listenerB.mock.calls.length).toBe(1)

    store.dispatch(unknownAction())
    expect(listenerA.mock.calls.length).toBe(3)
    expect(listenerB.mock.calls.length).toBe(2)

    unsubscribeB()
    expect(listenerA.mock.calls.length).toBe(3)
    expect(listenerB.mock.calls.length).toBe(2)

    store.dispatch(unknownAction())
    expect(listenerA.mock.calls.length).toBe(3)
    expect(listenerB.mock.calls.length).toBe(2)

    unsubscribeA = store.subscribe(listenerA)
    expect(listenerA.mock.calls.length).toBe(3)
    expect(listenerB.mock.calls.length).toBe(2)

    store.dispatch(unknownAction())
    expect(listenerA.mock.calls.length).toBe(4)
    expect(listenerB.mock.calls.length).toBe(2)
  })

  it('only removes listener once when unsubscribe is called', () => {
    const store = createStore(reducers.todos)
    const listenerA = jest.fn()
    const listenerB = jest.fn()

    const unsubscribeA = store.subscribe(listenerA)
    store.subscribe(listenerB)

    unsubscribeA()
    unsubscribeA()

    store.dispatch(unknownAction())
    expect(listenerA.mock.calls.length).toBe(0)
    expect(listenerB.mock.calls.length).toBe(1)
  })


  it('only removes relevant listener when unsubscribe is called', () => {
    const store = createStore(reducers.todos)
    const listener = jest.fn()

    store.subscribe(listener)
    const unsubscribeSecond = store.subscribe(listener)

    unsubscribeSecond()
    unsubscribeSecond()

    store.dispatch(unknownAction())
    expect(listener.mock.calls.length).toBe(1)
  })
})