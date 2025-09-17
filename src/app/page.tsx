import { Youtube } from 'lucide-react';
import { Downloader } from '@/components/downloader';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-3">
          <Youtube className="w-10 h-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            YTubeRip
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Fast and easy YouTube video downloads.
        </p>
      </header>
      <main className="w-full">
        <Downloader />
      </main>
      <footer className="w-full max-w-2xl mt-12 text-center text-muted-foreground text-xs">
        <p>
          Disclaimer: This tool is for personal use only. Please respect copyright laws and the terms of service of YouTube. Do not download content you do not have the rights to.
        </p>
      </footer>
    </div>
  );
}
