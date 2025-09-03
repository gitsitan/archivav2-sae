// "use client";

// import { useEffect, useState } from "react";

// interface Journal {
//   id: number;
//   annee: number;
//   type: string;
//   numero: number;
//   date_de_publication: string;
// }

// const ListeJournals = () => {
//   const [journaux, setJournaux] = useState<Journal[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchJournaux = async () => {
//       try {
//         const res = await fetch("/data/journaux.json");
//         const data = await res.json();
//         setJournaux(data.journaux);
//       } catch (error) {
//         console.error("Erreur lors du chargement des journaux:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJournaux();
//   }, []);

//   if (loading) return <p>Chargement...</p>;

//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-gray-900">Liste des Journaux</h1>
//       <br />
//       <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="text-left px-4 py-2">Année</th>
//             <th className="text-left px-4 py-2">Type</th>
//             <th className="text-left px-4 py-2">Numéro</th>
//             <th className="text-left px-4 py-2">Date de publication</th>
//           </tr>
//         </thead>
//         <tbody>
//           {journaux.map((journal) => (
//             <tr key={journal.id} className="border-t">
//               <td className="px-4 py-2">{journal.annee}</td>
//               <td className="px-4 py-2">{journal.type}</td>
//               <td className="px-4 py-2">{journal.numero}</td>
//               <td className="px-4 py-2">{journal.date_de_publication}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ListeJournals;
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminHeaders from "@/app/admin/components/adminHeader";

interface Journal {
  id: number;
  annee: number;
  type: string;
  numero: number;
  date_de_publication: string;
}

export default function ListeJournaux() {
  const [journaux, setJournaux] = useState<Journal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/data/journaux.json");
        const data = await res.json();
        setJournaux(data.journaux);
      } catch (error) {
        console.error("Erreur lors du chargement des journaux:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <AdminHeaders
        title="Liste des Journaux"
        desc="Ceci decrit la liste des journaux"
      />
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journaux.map((journal) => (
              <div
                key={journal.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Journal N°{journal.numero} ({journal.type})
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">
                      Année : {journal.annee}
                    </span>
                    <span className="text-sm text-gray-500">
                      Publié le : {journal.date_de_publication}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {journal.type}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
