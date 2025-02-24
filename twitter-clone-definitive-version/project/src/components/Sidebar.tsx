import React from 'react';
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  Bookmark, 
  User, 
  MoreHorizontal,
  Twitter,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SidebarItem = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors">
    <Icon className="h-6 w-6" />
    <span className="text-xl hidden xl:block">{text}</span>
  </div>
);

export default function Sidebar() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="fixed h-screen flex flex-col p-4 items-start">
      <div className="p-4">
        <Twitter className="h-8 w-8 text-blue-500" />
      </div>
      
      <nav className="flex flex-col gap-2">
        <SidebarItem icon={Home} text="Home" />
        <SidebarItem icon={Search} text="Explore" />
        <SidebarItem icon={Bell} text="Notifications" />
        <SidebarItem icon={Mail} text="Messages" />
        <SidebarItem icon={Bookmark} text="Bookmarks" />
        <SidebarItem icon={User} text="Profile" />
        <SidebarItem icon={MoreHorizontal} text="More" />
        <div 
          onClick={toggleDarkMode}
          className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6" />
          ) : (
            <Moon className="h-6 w-6" />
          )}
          <span className="text-xl hidden xl:block">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </div>
      </nav>
      
      <button className="mt-4 bg-blue-500 text-white rounded-full px-4 py-3 w-full font-bold hover:bg-blue-600 transition-colors">
        <span className="hidden xl:block">Tweet</span>
        <span className="xl:hidden">+</span>
      </button>
    </div>
  );
}