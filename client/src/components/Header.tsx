import { MapPin } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-md px-4 py-3 flex items-center">
      <div className="flex items-center">
        <h1 className="font-roboto font-bold text-2xl flex items-center">
          <MapPin className="mr-2 text-[#E41E31]" />
          <span className="text-[#003F8C]">Brussels</span>
          <span className="text-[#FAE042]">Explorer</span>
        </h1>
      </div>
    </header>
  );
}
