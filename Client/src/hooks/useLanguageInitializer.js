import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { initializeLanguage } from '../Store/LanguageSlice.js';
import { updateLanguageHeaders } from '../Api/language.api.js';

export const useLanguageInitializer = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      dispatch(initializeLanguage());
      updateLanguageHeaders(savedLanguage);
    }
  }, [dispatch, i18n]);

  return null;
};
