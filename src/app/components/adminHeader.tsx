/* eslint-disable @typescript-eslint/no-explicit-any */
type AdminHeadersProps = {
  title: string;
  desc?: string;
};
export default function AdminHeaders({ title, desc }: AdminHeadersProps) {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{desc}</p>
      </div>
    </>
  );
}
