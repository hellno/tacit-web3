import { createContext, useReducer } from 'react'

export const AppContext = createContext()

const initialState = {
  web3Modal: null,
  provider: null,
  account: null,
  library: null,
  network: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROVIDER':
      return {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...state, ...{ provider: action.provider }
      }
    case 'SET_ACCOUNT':
      return {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...state, ...{ account: action.account }
      }
    case 'SET_STATE':
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      return { ...state, ...action.state }
    case 'SET_WEB3_MODAL':
      return {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...state, ...{ web3Modal: action.web3Modal }
      }
  }
  return state
}

export const AppContextProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (<AppContext.Provider value={[state, dispatch]}>
    {props.children}
  </AppContext.Provider>)
}
