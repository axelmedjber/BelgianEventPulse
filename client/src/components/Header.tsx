import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="font-roboto font-bold text-2xl flex items-center">
          <MapPin className="mr-2 text-[#E41E31]" />
          <span className="text-[#003F8C]">Brussels</span>
          <span className="text-[#FAE042]">Explorer</span>
        </h1>
      </div>
      
      <div className="hidden md:flex space-x-4 text-sm">
        <a href="#" className="text-[#333333] hover:text-[#003F8C]">About</a>
        <a href="#" className="text-[#333333] hover:text-[#003F8C]">Contact</a>
        <a href="#" className="text-[#333333] hover:text-[#003F8C]">Login</a>
        <Button className="bg-[#003F8C] text-white px-3 py-1 rounded-md hover:bg-opacity-90">
          Sign Up
        </Button>
      </div>
      
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col space-y-4 mt-6">
            <a href="#" className="text-[#333333] hover:text-[#003F8C] py-2">About</a>
            <a href="#" className="text-[#333333] hover:text-[#003F8C] py-2">Contact</a>
            <a href="#" className="text-[#333333] hover:text-[#003F8C] py-2">Login</a>
            <Button className="bg-[#003F8C] text-white w-full">
              Sign Up
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
