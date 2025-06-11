'use client';

import { useI18n } from '@/lib/i18n.client'; // Will be created

export default function HomePage() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t('welcome_message')}</h1>
        <p className="mt-4 text-xl">{t('greeting')}</p>
      </div>
    </main>
  );
}
