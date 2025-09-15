import AdminLayout from "@/app/adminLayout";
import AdminHeaders from "@/app/components/adminHeader";

const ListeCommunique = () => {
  return (
    <>
      <AdminLayout>
        <AdminHeaders
          title="Liste des Communiques"
          desc="ceci concerne les communiques"
        />
      </AdminLayout>
    </>
  );
};
export default ListeCommunique;
