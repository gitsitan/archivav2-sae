import AdminLayout from "@/app/adminLayout";
import AdminHeaders from "@/app/components/adminHeader";

const ListeActualite = () => {
  return (
    <>
      <AdminLayout>
        <AdminHeaders
          title="Liste des Actualités"
          desc="ceci concerne les actualités"
        />
      </AdminLayout>
    </>
  );
};
export default ListeActualite;
