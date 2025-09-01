import MainHeader from '@/components/layout/main-header';
import HeroSection from '@/components/layout/hero-section';
import DocumentSections from '@/components/layout/document-sections';
import MainFooter from '@/components/layout/main-footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      <main className="flex-1">
        <HeroSection />
        <DocumentSections />
      </main>
      <MainFooter />
    </div>
  );
}
