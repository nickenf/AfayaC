import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {t('app.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50">
                {t('app.login')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  {t('home.welcome')}
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  {t('home.description')}
                </p>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App