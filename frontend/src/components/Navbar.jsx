import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartTotal, cartItemsCount } = useCart();

    return (
        <nav className="bg-red-600 text-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl md:text-2xl font-bold truncate">DeliveryApp</Link>

                <div className="flex items-center space-x-2 md:space-x-4">
                    {user ? (
                        <>
                            {user.role === 'RESTAURANT_OWNER' && (
                                <Link to="/admin" className="hidden md:block hover:text-red-200 text-sm font-medium">Meu Restaurante</Link>
                            )}
                            <Link to="/orders" className="hover:text-red-200" title="Orders">
                                <span className="hidden md:inline">Pedidos</span>
                                <span className="md:hidden">Pedidos</span> {/* Keep text or icon? Let's use icon if possible or short text */}
                            </Link>
                            <Link to="/cart" className="flex items-center hover:text-red-200 relative">
                                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-red-600 shadow-sm">
                                        {cartItemsCount}
                                    </span>
                                )}
                                <span className="hidden md:inline ml-2 text-sm font-bold">R$ {cartTotal.toFixed(2)}</span>
                            </Link>
                            <div className="flex items-center space-x-1 md:space-x-2">
                                <User className="w-5 h-5 md:w-6 md:h-6" />
                                <span className="text-sm hidden md:inline max-w-[100px] truncate">{user.name}</span>
                            </div>
                            <button onClick={logout} className="hover:text-red-200" title="Sair">
                                <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm md:text-base hover:text-red-200 font-medium">Entrar</Link>
                            <Link to="/register" className="text-sm md:text-base bg-white text-red-600 px-3 py-1 md:px-4 rounded-full hover:bg-gray-100 font-bold transition-colors shadow-sm">Criar Conta</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
