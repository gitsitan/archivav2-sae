import MainHeader from '@/components/layout/main-header';
import MainFooter from '@/components/layout/main-footer';
import HeroSection from '@/components/home/hero-section';
import DocumentSections from '@/components/home/document-section';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      <main className="flex-1">
       <h1>Page CONTACTEZ-NOUS</h1>

      </main>
      <MainFooter />
    </div>
  );
}
