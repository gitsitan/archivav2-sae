import Image from "next/image";
import Link from "next/link";
import logo from "/public/logo/logo-tchad.png";

const MainFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="government-header text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Government Logo and Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-16 h-16">
                <Image
                  src={logo}
                  alt="Tchad Government Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-sm opacity-90">République du Tchad </p>
                <p className="text-xs opacity-75">
                  Secrétariat Général du Gouvernement
                </p>
                <h3 className="text-lg font-bold">Journal Officiel</h3>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Le Secrétariat Général du Gouvernement du Tchad est l'organe
              central de coordination administrative du Gouvernement. Il assure
              la publication du Journal Officiel et la diffusion des textes
              législatifs et réglementaires.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/secretariat/presentation"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                >
                  Présentation du SGG
                </Link>
              </li>
              <li>
                <Link
                  href="/journal-officiel"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                >
                  Journal Officiel
                </Link>
              </li>
              <li>
                <Link
                  href="/communiques"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                >
                  Communiqués du Conseil
                </Link>
              </li>
              <li>
                <Link
                  href="/recherche"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                >
                  Recherche
                </Link>
              </li>
              <li>
                <Link
                  href="/secretariat/abonnements"
                  className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                >
                  Abonnements
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm opacity-80">
              <div>
                <p className="font-medium">Adresse:</p>
                <p>Quartier du Fleuve, Bamako</p>
                <p>République du Tchad</p>
              </div>
              <div>
                <p className="font-medium">Téléphone:</p>
                <p>+223 20 22 42 50</p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p>info@sgg.gouv.td</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Links */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-semibold mb-3">Secrétariat Général</h5>
              <ul className="space-y-1 text-sm opacity-80">
                <li>
                  <Link
                    href="/secretariat/organisation"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Organisation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/secretariat/liens"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Liens utiles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/secretariat/actualites"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Actualités
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-3">Droit Tchaden</h5>
              <ul className="space-y-1 text-sm opacity-80">
                <li>
                  <Link
                    href="/droit-tchadien/codes"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Codes en vigueur
                  </Link>
                </li>
                <li>
                  <Link
                    href="/droit-tchadien/textes-consolides"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Textes consolidés
                  </Link>
                </li>
                <li>
                  <Link
                    href="/droit-tchadien/publications"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Publications spéciales
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-3">Droit Régional</h5>
              <ul className="space-y-1 text-sm opacity-80">
                <li>
                  <Link
                    href="/droit-regional/ohada"
                    className="hover:opacity-100 transition-opacity"
                  >
                    OHADA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/droit-regional/uemoa"
                    className="hover:opacity-100 transition-opacity"
                  >
                    UEMOA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/droit-regional/cima"
                    className="hover:opacity-100 transition-opacity"
                  >
                    CIMA
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm opacity-80 mb-4 md:mb-0">
              <Link
                href="/aide"
                className="hover:opacity-100 transition-opacity mr-4"
              >
                Aide / Mode d'emploi
              </Link>
              <span className="mr-4">|</span>
              <Link
                href="/mentions-legales"
                className="hover:opacity-100 transition-opacity mr-4"
              >
                Mentions Légales
              </Link>
              <span className="mr-4">|</span>
              <span>© 2015-{currentYear}</span>
            </div>
            <div className="text-sm opacity-80">
              <Link
                href="/"
                className="hover:opacity-100 transition-opacity font-medium"
              >
                sgg.gouv.td
              </Link>
              <span className="ml-2">
                Secrétariat Général du Gouvernement du Tchad - Journal Officiel
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
