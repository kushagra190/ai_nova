import { configureStore } from '@reduxjs/toolkit'
import rcaReducer from './rcaSlice.js'

export const store = configureStore({
  reducer: {
    rca: rcaReducer,
  },
})
