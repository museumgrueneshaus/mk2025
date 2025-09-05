'use client';

import { useState, useEffect } from 'react';

interface Exponat {
  id: number;
  attributes: {
    titel: string;
    kurzbeschreibung?: string;
    inventarnummer?: string;
    epoche?: string;
    ist_highlight?: boolean;
    hauptbild?: {
      data?: {
        attributes: {
          url: string;
        }
      }
    }
  }
}

export default function Home() {
  const [exponate, setExponate] = useState<Exponat[]>([]);
  const [view, setView] = useState<'grid' | 'list' | 'masonry'>('grid');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExponate();
  }, []);

  const fetchExponate = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:1337/api/exponate?populate=*');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Loaded exponate:', data);
      
      if (data && data.data) {
        // Füge Beispielbilder zu den Exponaten hinzu
        const exponateWithImages = data.data.map((exp: Exponat, index: number) => {
          if (!exp.hauptbild) {
            // Museum-relevante Bilder von Unsplash
            const imageUrls = [
              'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=400', // Antike Statue
              'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400', // Vase
              'https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=400', // Museum Artefakt
              'https://images.unsplash.com/photo-1609102026400-3c0ca378e4c5?w=400', // Römische Statue
              'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', // Ägyptische Kunst
              'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400', // Antike Kunst
              'https://images.unsplash.com/photo-1612690669207-fed642192c40?w=400', // Museum Display
              'https://images.unsplash.com/photo-1599582893720-79e5b1ee5117?w=400'  // Keramik
            ];
            exp.hauptbild = { url: imageUrls[index % imageUrls.length] };
          }
          return exp;
        });
        setExponate(exponateWithImages);
      } else {
        setExponate([]);
      }
    } catch (error) {
      console.error('Error fetching exponate:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Exponate');
    } finally {
      setLoading(false);
    }
  };

  const filteredExponate = exponate.filter(exponat => {
    if (!exponat) return false;
    const titel = exponat.titel?.toLowerCase() || '';
    const beschreibung = exponat.kurzbeschreibung?.toLowerCase() || '';
    const searchTerm = filter.toLowerCase();
    return titel.includes(searchTerm) || beschreibung.includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Museumskatalog</h1>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* View Toggle */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setView('masonry')}
                  className={`p-2 rounded ${view === 'masonry' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  title="Masonry View"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 4a2 2 0 012-2h5a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V4zM13 4a2 2 0 012-2h1a2 2 0 012 2v3a2 2 0 01-2 2h-1a2 2 0 01-2-2V4zM2 14a2 2 0 012-2h1a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zM9 13a2 2 0 012-2h5a2 2 0 012 2v3a2 2 0 01-2 2h-5a2 2 0 01-2-2v-3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Fehler!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={() => { setError(null); fetchExponate(); }}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Erneut versuchen
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 flex items-center justify-between">
              <div className="text-gray-600">
                {filteredExponate.length} von {exponate.length} Exponaten
              </div>
              <div className="flex space-x-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {exponate.filter(e => e?.ist_highlight).length} Highlights
                </span>
              </div>
            </div>

            {/* Grid View */}
            {view === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredExponate.map((exponat) => {
                  const hauptbildUrl = exponat.hauptbild?.data?.attributes?.url || exponat.hauptbild?.url;
                  return (
                    <div key={exponat.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                        {hauptbildUrl ? (
                          <img 
                            src={hauptbildUrl.startsWith('http') ? hauptbildUrl : `http://localhost:1337${hauptbildUrl}`}
                            alt={exponat.titel || ''}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {exponat.ist_highlight && (
                          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">Highlight</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{exponat.titel || 'Ohne Titel'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{exponat.kurzbeschreibung || ''}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{exponat.inventarnummer || ''}</span>
                          <span>{exponat.epoche || ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {view === 'list' && (
              <div className="space-y-4">
                {filteredExponate.map((exponat) => {
                  const hauptbildUrl = exponat.hauptbild?.data?.attributes?.url || exponat.hauptbild?.url;
                  return (
                    <div key={exponat.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex">
                      {hauptbildUrl ? (
                        <img 
                          src={hauptbildUrl.startsWith('http') ? hauptbildUrl : `http://localhost:1337${hauptbildUrl}`}
                          alt={exponat.titel || ''}
                          className="w-32 h-32 object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{exponat.titel || 'Ohne Titel'}</h3>
                            <p className="text-sm text-gray-600 mb-2">{exponat.kurzbeschreibung || ''}</p>
                            <div className="flex space-x-4 text-xs text-gray-500">
                              <span>Nr: {exponat.inventarnummer || '-'}</span>
                              <span>Epoche: {exponat.epoche || '-'}</span>
                            </div>
                          </div>
                          {exponat.ist_highlight && (
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">Highlight</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Masonry View */}
            {view === 'masonry' && (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {filteredExponate.map((exponat) => {
                  const hauptbildUrl = exponat.hauptbild?.data?.attributes?.url || exponat.hauptbild?.url;
                  return (
                    <div key={exponat.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow break-inside-avoid mb-6 relative">
                      {hauptbildUrl && (
                        <img 
                          src={hauptbildUrl.startsWith('http') ? hauptbildUrl : `http://localhost:1337${hauptbildUrl}`}
                          alt={exponat.titel || ''}
                          className="w-full object-cover"
                        />
                      )}
                      {exponat.ist_highlight && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">Highlight</span>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{exponat.titel || 'Ohne Titel'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{exponat.kurzbeschreibung || ''}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{exponat.inventarnummer || ''}</span>
                          <span>{exponat.epoche || ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredExponate.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">Keine Exponate gefunden</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}