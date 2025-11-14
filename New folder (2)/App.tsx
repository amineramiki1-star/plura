import React, { useState, useCallback } from 'react';
import { MovieList } from './components/MovieList';
import { TvShowList } from './components/TvShowList';
import { AnimeList } from './components/AnimeList';
import { BottomNav } from './components/BottomNav';
import { ContentDetailView } from './components/ContentDetailView';
import { MyListView } from './components/MyListView';
import { LibraryProvider } from './services/libraryService';
import { WelcomeScreen } from './components/WelcomeScreen';
import type { View, ContentItem } from './types';
import { FocusProvider } from './hooks/useFocus';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('movies');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetailView = () => {
    setSelectedItem(null);
  };

  const handleEnterApp = () => {
    setShowWelcome(false);
  };

  const renderActiveView = useCallback(() => {
    switch (activeView) {
      case 'tv':
        return <TvShowList onItemSelected={handleSelectItem} />;
      case 'anime':
        return <AnimeList onItemSelected={handleSelectItem} />;
      case 'library':
        return <MyListView onItemSelected={handleSelectItem} />;
      case 'movies':
      default:
        return <MovieList onItemSelected={handleSelectItem} />;
    }
  }, [activeView]);

  return (
    <FocusProvider>
      <LibraryProvider>
          <div 
            className="h-full w-full bg-cover bg-center bg-no-repeat text-white font-sans relative flex flex-col"
            style={{ backgroundImage: "url('https://picsum.photos/1920/1080?blur=10')" }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
              {renderActiveView()}
            </main>

            <footer className="relative z-20 p-4">
              <BottomNav activeView={activeView} setActiveView={setActiveView} />
            </footer>

            {selectedItem && (
              <ContentDetailView 
                item={selectedItem}
                onClose={handleCloseDetailView}
              />
            )}

            {showWelcome && <WelcomeScreen onEnter={handleEnterApp} />}
          </div>
      </LibraryProvider>
    </FocusProvider>
  );
};

export default App;
