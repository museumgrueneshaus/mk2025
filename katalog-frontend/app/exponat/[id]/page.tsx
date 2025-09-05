'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Exponat {
  id: number;
  documentId: string;
  titel: string;
  untertitel?: string;
  kurzbeschreibung?: string;
  beschreibung?: string;
  inventarnummer?: string;
  epoche?: string;
  jahr_von?: number;
  jahr_bis?: number;
  kuenstler?: string;
  entstehungsort?: string;
  material?: string;
  masse?: string;
  ist_highlight?: boolean;
  hauptbild?: {
    url?: string;
    data?: {
      attributes?: {
        url: string;
      }
    }
  };
  bilder?: any;
  audio?: any;
  videos?: any;
}

export default function ExponatDetail() {
  const params = useParams();
  const router = useRouter();
  const [exponat, setExponat] = useState<Exponat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<'info' | 'images' | 'audio' | 'video'>('info');

  useEffect(() => {
    if (params.id) {
      fetchExponat(params.id as string);
    }
  }, [params.id]);

  const fetchExponat = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:1337/api/exponate/${id}?populate=*`);
      const data = await response.json();
      
      if (data.data) {
        // Füge Beispielmedien hinzu wenn keine vorhanden
        const exp = data.data;
        if (!exp.hauptbild) {
          exp.hauptbild = { url: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=800' };
        }
        if (!exp.audio || exp.audio?.length === 0) {
          exp.audio = [
            { url: '/audio/sample-guide.mp3', name: 'Audioguide Deutsch' },
            { url: '/audio/sample-guide-en.mp3', name: 'Audio Guide English' }
          ];
        }
        if (!exp.videos || exp.videos?.length === 0) {
          exp.videos = [
            { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', name: 'Dokumentation' }
          ];
        }
        setExponat(exp);
      }
    } catch (error) {
      console.error('Error loading exponat:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exponat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Exponat nicht gefunden</h1>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const hauptbildUrl = exponat.hauptbild?.url || exponat.hauptbild?.data?.attributes?.url;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück
            </button>
            {exponat.ist_highlight && (
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded text-sm font-semibold">
                Highlight
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Bild */}
            <div className="md:w-1/2">
              {hauptbildUrl ? (
                <img 
                  src={hauptbildUrl.startsWith('http') ? hauptbildUrl : `http://localhost:1337${hauptbildUrl}`}
                  alt={exponat.titel}
                  className="w-full h-96 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-96 md:h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold mb-2">{exponat.titel}</h1>
              {exponat.untertitel && (
                <h2 className="text-xl text-gray-600 mb-4">{exponat.untertitel}</h2>
              )}
              
              <div className="mb-6">
                <p className="text-lg text-gray-700">{exponat.kurzbeschreibung}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                {exponat.inventarnummer && (
                  <div>
                    <span className="font-semibold">Inventarnummer:</span> {exponat.inventarnummer}
                  </div>
                )}
                {exponat.epoche && (
                  <div>
                    <span className="font-semibold">Epoche:</span> {exponat.epoche}
                  </div>
                )}
                {exponat.kuenstler && (
                  <div>
                    <span className="font-semibold">Künstler:</span> {exponat.kuenstler}
                  </div>
                )}
                {exponat.entstehungsort && (
                  <div>
                    <span className="font-semibold">Entstehungsort:</span> {exponat.entstehungsort}
                  </div>
                )}
                {exponat.material && (
                  <div>
                    <span className="font-semibold">Material:</span> {exponat.material}
                  </div>
                )}
                {exponat.masse && (
                  <div>
                    <span className="font-semibold">Maße:</span> {exponat.masse}
                  </div>
                )}
                {(exponat.jahr_von || exponat.jahr_bis) && (
                  <div>
                    <span className="font-semibold">Datierung:</span> {exponat.jahr_von}{exponat.jahr_bis && exponat.jahr_von !== exponat.jahr_bis ? `-${exponat.jahr_bis}` : ''}
                  </div>
                )}
              </div>

              {/* Media Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-4">
                  <button
                    onClick={() => setActiveMedia('info')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeMedia === 'info' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Beschreibung
                  </button>
                  <button
                    onClick={() => setActiveMedia('audio')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeMedia === 'audio' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Audio ({exponat.audio?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveMedia('video')}
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeMedia === 'video' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Videos ({exponat.videos?.length || 0})
                  </button>
                </nav>
              </div>

              {/* Media Content */}
              <div className="min-h-[200px]">
                {activeMedia === 'info' && exponat.beschreibung && (
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: exponat.beschreibung }} />
                  </div>
                )}

                {activeMedia === 'audio' && (
                  <div className="space-y-4">
                    {exponat.audio && exponat.audio.length > 0 ? (
                      exponat.audio.map((audio: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold mb-2">{audio.name || `Audio ${index + 1}`}</h3>
                          <audio controls className="w-full">
                            <source src={audio.url?.startsWith('http') ? audio.url : `http://localhost:1337${audio.url}`} />
                            Ihr Browser unterstützt keine Audio-Wiedergabe.
                          </audio>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Keine Audioguides verfügbar</p>
                    )}
                  </div>
                )}

                {activeMedia === 'video' && (
                  <div className="space-y-4">
                    {exponat.videos && exponat.videos.length > 0 ? (
                      exponat.videos.map((video: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold mb-2">{video.name || `Video ${index + 1}`}</h3>
                          {video.url?.includes('youtube') || video.url?.includes('youtu.be') ? (
                            <iframe
                              className="w-full aspect-video"
                              src={video.url}
                              title={video.name}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video controls className="w-full">
                              <source src={video.url?.startsWith('http') ? video.url : `http://localhost:1337${video.url}`} />
                              Ihr Browser unterstützt keine Video-Wiedergabe.
                            </video>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Keine Videos verfügbar</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}