import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import reducers
import authReducer from "../features/auth/authSlice";

// Configuration for persisting the state
const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "auth",
  ],
};

// Combine reducers for different features
const rootReducer = combineReducers({
  auth: authReducer, // Handles login/signup state
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store setup
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

// Persistor for persisting the store
const persistor = persistStore(store);

// Exports
export { store, persistor };
