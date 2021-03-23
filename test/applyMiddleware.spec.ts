import {
  createStore,
  applyMiddleware,
  Middleware,
  AnyAction,
  Action
} from '../src/index'
import * as reducers from './helpers/reducers'
import { addTodo, addTodoAsync, addTodoIfEmpty } from './helpers/actionCreators'
import { thunk } from './helpers/middleware'


describe('applyMiddleware', () => {
  it('warns when dispatch during middleware setup', () => {
    function dispatchingMiddleware(store) {
      store.dispatch(addTodo('Dont dispatch in middleware setup'))
      return next => action => next(action)
    }
    expect(() =>
      applyMiddleware(dispatchingMiddleware)(createStore)(reducers.todos)
    ).toThrow()
  })

  it('wraps dispatch method with middleware once', () => {
    function test(spyOnMethods) {
      return methods => {
        spyOnMethods(methods)
        return next => action => next(action)
      }
    }

    const spy = jest.fn()
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    store.dispatch(addTodo('Use Redux'))
    store.dispatch(addTodo('Flux FTW!'))

    expect(spy.mock.calls.length).toEqual(1)

    expect(spy.mock.calls[0][0]).toHaveProperty('getState')
    expect(spy.mock.calls[0][0]).toHaveProperty('dispatch')

    expect(store.getState()).toEqual([
      { id: 1, text: 'Use Redux' },
      { id: 2, text: 'Flux FTW!' }
    ])
  })
})