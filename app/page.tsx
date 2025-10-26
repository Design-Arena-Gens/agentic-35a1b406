'use client';

import { useState } from 'react';

interface Business {
  name: string;
  phone: string;
  address: string;
  source: string;
}

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Business[]>([]);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const startSearch = async () => {
    setIsSearching(true);
    setResults([]);
    setError('');
    setProgress('در حال شروع جستجو...');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('خطا در جستجو');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'progress') {
                  setProgress(data.message);
                } else if (data.type === 'result') {
                  setResults(prev => [...prev, data.business]);
                } else if (data.type === 'complete') {
                  setProgress('جستجو کامل شد!');
                  setIsSearching(false);
                } else if (data.type === 'error') {
                  setError(data.message);
                  setIsSearching(false);
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
      setIsSearching(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['نام', 'شماره تماس', 'آدرس', 'منبع'].join(','),
      ...results.map(b => [
        `"${b.name}"`,
        `"${b.phone}"`,
        `"${b.address}"`,
        `"${b.source}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'businesses_guilan.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            🏗️ جستجوگر کسب‌وکارهای بتن و مایه
          </h1>
          <p className="text-gray-600 text-center mb-8">
            جستجوی خودکار کسب‌وکارها در استان گیلان
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={startSearch}
              disabled={isSearching}
              className={`px-8 py-4 rounded-lg text-white font-bold text-lg transition-all transform hover:scale-105 ${
                isSearching
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
              }`}
            >
              {isSearching ? '🔍 در حال جستجو...' : '🚀 شروع جستجو'}
            </button>

            {results.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
              >
                📥 دانلود فایل CSV ({results.length} نتیجه)
              </button>
            )}
          </div>

          {progress && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-center font-medium">
                {progress}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-center font-medium">
                ⚠️ {error}
              </p>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📋 نتایج جستجو ({results.length} کسب‌وکار)
            </h2>
            <div className="grid gap-4">
              {results.map((business, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {business.name}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="font-semibold">📞 تلفن:</span>
                          <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                            {business.phone}
                          </a>
                        </p>
                        <p className="text-gray-600 flex items-start gap-2">
                          <span className="font-semibold">📍 آدرس:</span>
                          <span>{business.address}</span>
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <span className="font-semibold">🔗 منبع:</span>
                          <span className="truncate">{business.source}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
