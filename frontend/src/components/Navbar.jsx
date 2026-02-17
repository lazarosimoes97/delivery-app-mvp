import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, ChevronDown, Store, Package, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartTotal, cartItemsCount } = useCart();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white text-gray-800 shadow-sm sticky top-0 z-40 border-b border-gray-100 backdrop-blur-md bg-white/90">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-red-600 p-1.5 rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-red-100">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-red-600 tracking-tight">Charq<span className="text-gray-900">Food</span></span>
                </Link>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Cart Button - Visible only to logged in users */}
                    {user && (
                        <Link
                            to="/cart"
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-xl hover:bg-red-100 transition-all duration-300 relative group"
                        >
                            <div className="relative">
                                <ShoppingCart className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-in zoom-in">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </div>
                            <span className="hidden md:inline font-bold text-sm">
                                R$ {cartTotal.toFixed(2)}
                            </span>
                        </Link>
                    )}

                    {user ? (
                        /* User Menu Dropdown */
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-xl transition-colors pr-2"
                            >
                                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden shadow-inner">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Olá,</p>
                                    <p className="text-sm font-bold text-gray-800 leading-none truncate max-w-[80px]">{user.name.split(' ')[0]}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Content */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 bg-gray-50 flex items-center gap-3 border-b border-gray-100">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm truncate">{user.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{user.role === 'RESTAURANT_OWNER' ? 'Parceiro' : 'Cliente'}</p>
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4" /> Meu Perfil
                                        </Link>
                                        <Link
                                            to="/orders"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <Package className="w-4 h-4" /> Meus Pedidos
                                        </Link>
                                        {user.role === 'RESTAURANT_OWNER' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors mt-1"
                                            >
                                                <Store className="w-4 h-4" /> Painel da Loja
                                            </Link>
                                        )}
                                    </div>

                                    <div className="p-2 pt-0 border-t border-gray-50">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsUserMenuOpen(false);
                                                navigate('/login');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sair da conta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-red-600 px-4 py-2 transition-colors">Entrar</Link>
                            <Link
                                to="/register"
                                className="text-sm bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 font-bold transition-all shadow-lg shadow-red-100 active:scale-95"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
