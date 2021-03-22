import { Action, AnyAction } from "./actions"
import { Reducer } from "./reducers"

export type ExtendState<State, Extension> = [Extension] extends [never]
  ? State
  : State & Extension

declare const $CombinedState: unique symbol

export type CombinedState<S> = { readonly [$CombinedState]?: undefined } & S

export type PreloadedState<S> = Required<S> extends {
  [$CombinedState]: undefined
}
  ? S extends CombinedState<infer S1>
    ? {
        [K in keyof S1]?: S1[K] extends object ? PreloadedState<S1[K]> : S1[K]
      }
    : never
  : {
    [K in keyof S]: S[K] extends string | number | boolean | symbol
        ? S[K]
        : PreloadedState<S[K]>
  }

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T, ...extraArgs: any[]): T
}
// Store
export interface Store<
  S = any,
  A extends Action = AnyAction,
  StateExt = never,
  Ext = {}
> {
  dispatch: Dispatch<A>

  getState(): S

  // subscribe(listener: () => void): Unsubscribe

  // replaceReducer<NewState, NewActions extends Action>(
  //   nextReducer: Reducer<NewState, NewActions>
  // ): Store<ExtendState<NewState, StateExt>, NewActions, StateExt, Ext> & Ext

  // [Symbol.observable](): Observable<S>

}


// StoreEnhancer 定义
export type StoreEnhancer<Ext = {}, StateExt = never> = (
  next: StoreEnhancerStoreCreator<Ext, StateExt>
) => StoreEnhancerStoreCreator<Ext, StateExt>

export type StoreEnhancerStoreCreator<Ext = {}, StateExt = never> = <
  S = any,
  A extends Action = AnyAction
> (
  reducer: Reducer<S, A>,
  PreloadedState?: PreloadedState<S>
) => Store<ExtendState<S, StateExt>, A, StateExt, Ext> & Ext