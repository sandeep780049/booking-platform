import { createSlice } from '@reduxjs/toolkit';
const getInitialLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || 'en';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return 'en';
  }
};

const initialState = {
  currentLanguage: getInitialLanguage(),
  previousLanguage: null,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.previousLanguage = state.currentLanguage;
      state.currentLanguage = action.payload;

      // Save to localStorage
      try {
        localStorage.setItem('selectedLanguage', action.payload);
      } catch (error) {
        console.error('Error saving language to localStorage:', error);
      }
    },
    initializeLanguage: (state) => {
      // This action can be used to initialize language from localStorage
      const savedLanguage = getInitialLanguage();
      state.currentLanguage = savedLanguage;
    },
  },
});

export const { setLanguage, initializeLanguage } = languageSlice.actions;
export default languageSlice.reducer;
