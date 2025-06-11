import { createI18nServer } from 'next-international/server';

export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } = createI18nServer({
  en: () => import('@/../public/locales/en/common.json'),
  de: () => import('@/../public/locales/de/common.json'),
});
