"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  link: string;
  category: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "DES AGENTS DU SECRETARIAT GENERAL DU GOUVERNEMENT DISTINGUES PAR L'ETAT",
    excerpt: "Le Premier ministre, le Général de Division Abdoulaye MAIGA, a présidé lundi 16 décembre 2024, la cérémonie solennelle de décoration de plusieurs travailleurs de son Cabinet et des Services de la Primature.",
    image: "https://ext.same-assets.com/1082949689/2658864057.jpeg",
    link: "/actualites/agents-distingues",
    category: "Actualités"
  },
  {
    id: 2,
    title: "LES CAPACITES DES MEMBRES DU GOUVERNEMENT RENFORCEES",
    excerpt: "Le Premier ministre, Chef du Gouvernement, le Général de Division Abdoulaye MAIGA a présidé le 3 décembre 2024 à la Primature les travaux du Séminaire Gouvernemental.",
    image: "https://ext.same-assets.com/1082949689/3876981495.jpeg",
    link: "/actualites/capacites-renforcees",
    category: "Actualités"
  },
  {
    id: 3,
    title: "2ème édition de la Journée d'échanges de la Direction générale du Contentieux de l'Etat",
    excerpt: "La coordination des actions de lutte contre la corruption au centre des échanges. Le Secrétaire général du Gouvernement, Birama COULIBALY a pris part, jeudi 08 août 2024.",
    image: "https://ext.same-assets.com/1082949689/1018132906.jpeg",
    link: "/actualites/journee-echanges",
    category: "Actualités"
  },
  {
    id: 4,
    title: "Renforcement des capacités du personnel du Secrétariat Général du Gouvernement",
    excerpt: "Le ministre, Secrétaire général du Gouvernement, Monsieur Birama COULIBALY a présidé les travaux du séminaire de renforcement des capacités des cadres et du personnel d'exécution.",
    image: "https://ext.same-assets.com/1082949689/3110838013.jpeg",
    link: "/actualites/renforcement-capacites",
    category: "Actualités"
  },
  {
    id: 5,
    title: "Commémoration de la Journée internationale des Archives",
    excerpt: "La DNAM a respecté la tradition par l'organisation d'une conférence débat. Le ministre, Secrétaire général du Gouvernement, Monsieur Birama COULIBALY a présidé la cérémonie.",
    image: "https://ext.same-assets.com/1082949689/3587435415.jpeg",
    link: "/actualites/journee-archives",
    category: "Actualités"
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % newsItems.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentNews = newsItems[currentSlide];

  return (
    <section className="hero-section py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Main Carousel */}
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Image Section */}
              <div className="md:w-1/2 relative h-64 md:h-96">
                <Image
                  src={currentNews.image}
                  alt={currentNews.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    {currentNews.category}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {currentNews.title}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {currentNews.excerpt}
                </p>

                <Link
                  href={currentNews.link}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  [Lire la suite]
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Carousel Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {newsItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`carousel-dot ${
                  index === currentSlide ? 'active' : ''
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* News Thumbnails - Desktop Only */}
          <div className="hidden lg:block mt-8">
            <div className="grid grid-cols-5 gap-4">
              {newsItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToSlide(index)}
                  className={`group text-left transition-all duration-200 ${
                    index === currentSlide
                      ? 'opacity-100 transform scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative h-20 rounded-md overflow-hidden mb-2">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {index === currentSlide && (
                      <div className="absolute inset-0 ring-2 ring-primary ring-offset-2" />
                    )}
                  </div>
                  <h4 className="text-xs font-medium text-gray-900 line-clamp-2">
                    {item.title}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
