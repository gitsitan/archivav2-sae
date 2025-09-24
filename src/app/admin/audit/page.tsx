import AdminLayout from "@/app/adminLayout";
import AdminHeaders from "@/app/components/adminHeader";
import React from "react";
const AuditPage: React.FC = () => {
  return (
    <>
      <AdminLayout>
        <div>Binevenue sur la page Audit</div>
        <AdminHeaders
          title="Liste des pistes audit"
          desc="Ceci concerne la description des pistes audit"
        />
      </AdminLayout>
    </>
  );
};
export default AuditPage;
