import { Link, useLocation } from 'react-router-dom';
import { Home, Search, FileText, User } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Início', icon: Home },
        { path: '/search', label: 'Buscar', icon: Search }, // Placceholder for now
        { path: '/orders', label: 'Pedidos', icon: FileText },
        { path: '/profile', label: 'Perfil', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center z-50 md:hidden pb-safe">
            {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                    key={path}
                    to={path}
                    className={`flex flex-col items-center justify-center w-full space-y-1 ${isActive(path) ? 'text-gray-900' : 'text-gray-400'}`}
                >
                    <Icon className={`w-6 h-6 ${isActive(path) ? 'fill-current' : ''}`} strokeWidth={isActive(path) ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{label}</span>
                </Link>
            ))}
        </div>
    );
};

export default BottomNav;
