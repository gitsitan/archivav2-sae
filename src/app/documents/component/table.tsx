import AdminLayout from "@/app/adminLayout";
import AdminHeaders from "@/app/components/adminHeader";

const ListeDocument = () => {
  return (
    <>
      <AdminLayout>
        <AdminHeaders
          title="Liste des Documents"
          desc="ceci concerne les documents"
        />
      </AdminLayout>
    </>
  );
};
export default ListeDocument;
