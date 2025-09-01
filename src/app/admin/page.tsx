"use client";

import { FileText, Users, Eye, Upload, TrendingUp, Calendar, Bell, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Documents publiés',
      value: '2,847',
      change: '+12%',
      changeType: 'positive' as const,
      icon: <FileText className="h-8 w-8 text-blue-600" />
    },
    {
      title: 'Utilisateurs actifs',
      value: '1,234',
      change: '+5%',
      changeType: 'positive' as const,
      icon: <Users className="h-8 w-8 text-green-600" />
    },
    {
      title: 'Vues mensuelles',
      value: '45,678',
      change: '+18%',
      changeType: 'positive' as const,
      icon: <Eye className="h-8 w-8 text-purple-600" />
    },
    {
      title: 'Téléchargements',
      value: '8,901',
      change: '+3%',
      changeType: 'positive' as const,
      icon: <Download className="h-8 w-8 text-orange-600" />
    }
  ];

  const recentDocuments = [
    {
      id: 1,
      title: "Arrêt n°2025-09/CC du 25 août 2025",
      type: "Arrêt constitutionnel",
      date: "25/08/2025",
      status: "Publié"
    },
    {
      id: 2,
      title: "Décret n°2025-0527/PT-RM du 31 juillet 2025",
      type: "Décret",
      date: "31/07/2025",
      status: "Publié"
    },
    {
      id: 3,
      title: "Loi n°2025-037 du 31 juillet 2025",
      type: "Loi organique",
      date: "31/07/2025",
      status: "En attente"
    },
    {
      id: 4,
      title: "JO n°2025-11 spécial du 27/08/2025",
      type: "Journal Officiel",
      date: "27/08/2025",
      status: "Publié"
    }
  ];

  const quickActions = [
    {
      title: "Publier un nouveau document",
      description: "Ajouter un texte officiel",
      icon: <Upload className="h-6 w-6" />,
      href: "/admin/content/documents/new",
      color: "bg-blue-500"
    },
    {
      title: "Créer une actualité",
      description: "Publier une nouvelle actualité",
      icon: <FileText className="h-6 w-6" />,
      href: "/admin/content/news/new",
      color: "bg-green-500"
    },
    {
      title: "Gestion des utilisateurs",
      description: "Administrer les comptes",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/users",
      color: "bg-purple-500"
    },
    {
      title: "Voir les statistiques",
      description: "Analyser les performances",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/admin/analytics",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Bienvenue dans le panel d'administration SGG Mali</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Aujourd'hui
          </Button>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} vs mois dernier
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Documents récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {doc.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{doc.type}</span>
                        <span className="text-sm text-gray-500">{doc.date}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      doc.status === 'Publié'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Voir tous les documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    asChild
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`${action.color} text-white p-2 rounded-md flex-shrink-0`}>
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>État du système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Serveur</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">En ligne</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Base de données</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Connectée</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stockage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600">78% utilisé</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sauvegardes</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">À jour</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
