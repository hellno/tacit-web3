import { createContext, useReducer } from 'react'

export const AppContext = createContext()

const initialState = {
  ensName: null
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ENS_NAME':
      return {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...state, ...{ ensName: action.state.ensName }
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
