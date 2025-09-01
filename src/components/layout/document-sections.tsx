"use client";

import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DocumentItem {
  id: string;
  title: string;
  date: string;
  link: string;
  type?: string;
}

const latestTexts: DocumentItem[] = [
  {
    id: '1',
    title: "Arrêt n°2025-09/CC du 25 août 2025 de la Cour Constitutionnelle relatif à la requête du Président de la Transition, Chef de l'Etat aux fins de contrôle...",
    date: "25 août 2025",
    link: "/documents/arret-2025-09-cc.pdf"
  },
  {
    id: '2',
    title: "Décret n°2025-0527/PT-RM du 31 juillet 2025 portant convocation du Conseil national de Transition en session extraordinaire",
    date: "31 juillet 2025",
    link: "/documents/decret-2025-0527.pdf"
  },
  {
    id: '3',
    title: "Loi n°2025-037 du 31 juillet 2025 portant loi organique fixant les indemnités et les autres avantages alloués aux membres du Conseil national de Transition",
    date: "31 juillet 2025",
    link: "/documents/loi-2025-037.pdf"
  }
];

const latestJournals: DocumentItem[] = [
  {
    id: '1',
    title: "JO n°2025-11 spécial du 27/08/2025",
    date: "27/08/2025",
    link: "/journals/mali-jo-2025-11-sp.pdf",
    type: "spécial"
  },
  {
    id: '2',
    title: "JO n°2025-23 du 08/08/2025",
    date: "08/08/2025",
    link: "/journals/mali-jo-2025-23.pdf"
  },
  {
    id: '3',
    title: "JO n°2025-22 du 01/08/2025",
    date: "01/08/2025",
    link: "/journals/mali-jo-2025-22.pdf"
  },
  {
    id: '4',
    title: "JO n°2025-10 spécial du 31/07/2025",
    date: "31/07/2025",
    link: "/journals/mali-jo-2025-10-sp.pdf",
    type: "spécial"
  },
  {
    id: '5',
    title: "JO n°2025-21 du 25/07/2025",
    date: "25/07/2025",
    link: "/journals/mali-jo-2025-21.pdf"
  },
  {
    id: '6',
    title: "JO n°2025-09 spécial du 23/07/2025",
    date: "23/07/2025",
    link: "/journals/mali-jo-2025-09-sp.pdf",
    type: "spécial"
  }
];

const latestCommuniques: DocumentItem[] = [
  {
    id: '1',
    title: "Communiqué du 27/08/2025",
    date: "27/08/2025",
    link: "/communiques/communique-27-08-2025.pdf"
  },
  {
    id: '2',
    title: "Communiqué du 20/08/2025",
    date: "20/08/2025",
    link: "/communiques/communique-20-08-2025.pdf"
  },
  {
    id: '3',
    title: "Communiqué du 13/08/2025",
    date: "13/08/2025",
    link: "/communiques/communique-13-08-2025.pdf"
  },
  {
    id: '4',
    title: "Communiqué du 06/08/2025",
    date: "06/08/2025",
    link: "/communiques/communique-06-08-2025.pdf"
  },
  {
    id: '5',
    title: "Communiqué du 30/07/2025",
    date: "30/07/2025",
    link: "/communiques/communique-30-07-2025.pdf"
  },
  {
    id: '6',
    title: "Communiqué du 23/07/2025",
    date: "23/07/2025",
    link: "/communiques/communique-23-07-2025.pdf"
  }
];

const DocumentCard = ({
  title,
  items,
  moreLink,
  headerColor
}: {
  title: string;
  items: DocumentItem[];
  moreLink: string;
  headerColor: string;
}) => (
  <Card className="h-full document-card">
    <CardHeader className={`${headerColor} text-white`}>
      <CardTitle className="text-lg font-semibold text-center">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="space-y-0">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Link
                  href={item.link}
                  className="group block"
                >
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors duration-200 line-clamp-3 mb-1">
                    {item.title}
                    {item.type && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {item.type}
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {item.date}
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <Link
          href={moreLink}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
        >
          <span>&gt; Autres {title.toLowerCase()}</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </CardContent>
  </Card>
);

const DocumentSections = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Texts */}
          <DocumentCard
            title="DERNIERS TEXTES PARUS"
            items={latestTexts}
            moreLink="/recherche"
            headerColor="bg-gradient-to-r from-primary to-primary/90"
          />

          {/* Latest Official Journals */}
          <DocumentCard
            title="DERNIERS JOURNAUX OFFICIELS PARUS"
            items={latestJournals}
            moreLink="/journal-officiel"
            headerColor="bg-gradient-to-r from-blue-600 to-blue-500"
          />

          {/* Latest Communiqués */}
          <DocumentCard
            title="COMMUNIQUÉS DU CONSEIL DES MINISTRES"
            items={latestCommuniques}
            moreLink="/communiques"
            headerColor="bg-gradient-to-r from-green-600 to-green-500"
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-primary mb-2">2,847</div>
            <div className="text-sm text-gray-600">Documents publiés</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
            <div className="text-sm text-gray-600">Journaux officiels</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">89</div>
            <div className="text-sm text-gray-600">Communiqués récents</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentSections;
