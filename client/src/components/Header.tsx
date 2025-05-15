import { MapPin, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../../src/components/ThemeProvider';

export default function Header() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <header className="bg-background shadow-md px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="font-roboto font-bold text-2xl flex items-center">
          <MapPin className="mr-2 text-[#E41E31]" />
          <span className="text-[#003F8C]">Brussels</span>
          <span className="text-[#FAE042]">Now</span>
        </h1>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme}
        className="rounded-full"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}
