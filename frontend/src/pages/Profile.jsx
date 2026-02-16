import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChevronLeft,
    User,
    FileText,
    Heart,
    ShieldCheck,
    LogOut,
    ChevronRight
} from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: User, label: 'Meus dados', path: '/profile/edit' },
        { icon: ShieldCheck, label: 'Segurança', path: '/profile/security' },
        { icon: Heart, label: 'Favoritos', path: '/favorites' },
        { icon: FileText, label: 'Meus Pedidos', path: '/orders' },
    ];

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <button onClick={() => navigate(-1)} className="text-red-500 mr-4">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 text-center font-medium text-gray-700 uppercase tracking-wide">
                    {user?.name || 'Perfil'}
                </div>
                <div className="w-6"></div> {/* Spacer for centering */}
            </div>

            {/* Menu List */}
            <div className="mt-2">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition border-b border-gray-50 last:border-b-0"
                    >
                        <div className="flex items-center gap-4 text-gray-500">
                            <item.icon className="w-6 h-6" strokeWidth={1.5} />
                            <span className="text-gray-600 text-base font-normal">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition border-b border-gray-50 mt-2"
                >
                    <div className="flex items-center gap-4 text-gray-500">
                        <LogOut className="w-6 h-6" strokeWidth={1.5} />
                        <span className="text-gray-600 text-base font-normal">Sair</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Banner */}
            <div className="p-4 mt-8">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-16 bg-red-100 rounded-lg flex items-center justify-center relative overflow-visible">
                            <div className="absolute -top-2 bg-red-500 rounded-full p-1.5 shadow-sm">
                                <span className="block w-2 h-2 bg-white rounded-full"></span>
                            </div>
                            <span className="text-2xl">🛍️</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm mb-1">Adicione o DeliveryApp à tela inicial</h3>
                        <p className="text-xs text-gray-500 mb-3">Aproveite a versão mais leve do app, adicionando-a à sua tela inicial</p>
                        <button className="bg-red-600 text-white text-xs font-bold py-2 px-4 rounded hover:bg-red-700 transition">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
