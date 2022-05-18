import { createContext, useReducer } from 'react'

export const AppContext = createContext()

const initialState = {
  provider: null,
  account: null,
  library: null,
  network: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROVIDER':
      return {
        ...state, ...{
          provider: action.provider
        }
      }
    case 'SET_STATE':
      return { ...state, ...action.state }
  }
  return state
}

export const AppContextProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (<AppContext.Provider value={[state, dispatch]}>
    {props.children}
  </AppContext.Provider>)
}
