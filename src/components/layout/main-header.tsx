"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const MainHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      title: "SECRÉTARIAT GÉNÉRAL",
      href: "/secretariat",
      submenu: [
        { title: "Présentation", href: "/secretariat/presentation" },
        { title: "Organisation", href: "/secretariat/organisation" },
      ],
    },
    {
      title: "JOURNAL OFFICIEL",
      href: "/journal-officiel",
      submenu: [
        {
          title: "Edition ordinaire",
          href: "/journal-officiel/edition-ordinaire",
        },
        {
          title: "Edition spéciaux",
          href: "/journal-officiel/edition-speciaux",
        },
       
      ],
    },
    {
      title: "DROIT TCHADIEN",
      href: "/droit-tchadien",
      submenu: [
        { title: "Journal Officiel", href: "/droit-tchadien/journal-officiel" },
        {
          title: "Journaux spéciaux",
          href: "/droit-tchadien/journaux-speciaux",
        },
        { title: "Codes en vigueur", href: "/droit-tchadien/codes" },
        {
          title: "Textes version consolidée",
          href: "/droit-tchadien/textes-consolides",
        },
        {
          title: "Communiqués du Conseil des Ministres",
          href: "/droit-tchadien/communiques",
        },
        {
          title: "Publications spéciales",
          href: "/droit-tchadien/publications",
        },
      ],
    },
    {
      title: "DROIT RÉGIONAL",
      href: "/droit-regional",
      submenu: [
        { title: "CIMA", href: "/droit-regional/cima" },
        { title: "CIPRES", href: "/droit-regional/cipres" },
        { title: "OAPI", href: "/droit-regional/oapi" },
        { title: "OHADA", href: "/droit-regional/ohada" },
        { title: "UEMOA", href: "/droit-regional/uemoa" },
      ],
    },
    {
      title: "CONVENTIONS",
      href: "/conventions",
    },
    {
      title: "CONTACTS",
      href: "/contacts",
      submenu: [
        { title: "Contactez-Nous", href: "/contacts/nous-contacter" },
        { title: "Vos interlocuteurs", href: "/contacts/interlocuteurs" },
      ],
    },
  ];

  return (
    <header className="w-full">
      {/* Top Government Bar */}
      <div className="government-header text-white">
        <div className="container mx-auto  py-4">
          <div className="hidden md:block">
            {/* Header Background Pattern */}
            <div className="absolute -top-[26px] bottom-0 left-[669px] right-0 z-0 overflow-hidden opacity-80 pointer-events-none">
              <Image
                src="/logo/maison.png"
                alt="Government Building"
                width={500}
                height={2000}
                className="object-cover"
                style={{
                  maskImage:
                    "linear-gradient(to left, transparent 0%, black 20%)",
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Government Seal */}
              <div className="relative w-16 h-16">
                <Image
                  src="/logo/tchad-seal.png"
                  alt="Tchad Government Seal"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <div className="hidden md:block">
                <p className="text-sm opacity-90">République du Tchad</p>
                <p className="text-xs opacity-75">
                  Secrétariat Général du Gouvernement
                </p>
                <h1 className="text-lg font-bold">Journal Officiel</h1>
              </div>
            </div>

            {/* Mobile title */}
            <div className="md:hidden text-center flex-1 ml-4">
              <h1 className="text-sm font-bold">République du Tchad</h1>
              <p className="text-xs opacity-90">SGG - Journal Officiel</p>
            </div>

            {/* Header Background Pattern */}
            <div className="hidden lg:block">
              {/* Tchad Flag */}
              {/* <div className="mali-flag w-12 h-8 rounded"></div> */}
              <div className="flex h-14 w-24 border border-gray-400">
                <div className="bg-[#002664] flex-1"></div>
                <div className="bg-[#FECB00] flex-1"></div>
                <div className="bg-[#C60C30] flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md border-b relative z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div key={item.title} className="relative group">
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 flex items-center"
                  >
                    {item.title}
                    {item.submenu && (
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.submenu && (
                    <div className="absolute left-0 mt-1 w-72 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-200"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Search Button */}
            <Link
              href="/recherche"
              className="hidden lg:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200"
            >
              <Search className="h-4 w-4" />
              <span>RECHERCHE</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mobile-nav">
            <div className="px-4 py-6 space-y-4">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  <Link
                    href={item.href}
                    className="block text-lg font-medium py-2 border-b border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className="block text-sm opacity-80 py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/recherche"
                className="flex items-center space-x-2 text-lg font-medium py-2 border-b border-white/20"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-5 w-5" />
                <span>RECHERCHE</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default MainHeader;
