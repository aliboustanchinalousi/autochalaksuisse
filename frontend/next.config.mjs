/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you are using next-i18next, uncomment this part
  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en', 'de'],
  // },
  // localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
};

export default nextConfig;
