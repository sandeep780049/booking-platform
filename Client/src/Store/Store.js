import { configureStore } from '@reduxjs/toolkit';
import userReducer from './UserSlice';
import languageReducer from './LanguageSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    language: languageReducer,
  },
});
