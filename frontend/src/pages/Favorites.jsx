import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Heart, MapPin, Star, Utensils } from 'lucide-react';

const Favorites = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axios.get('/users/favorites');
                setFavorites(res.data);
            } catch (error) {
                console.error('Erro ao buscar favoritos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const toggleFavorite = async (restaurantId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.post(`/users/favorites/${restaurantId}`);
            setFavorites(prev => prev.filter(f => f.id !== restaurantId));
        } catch (error) {
            alert('Erro ao remover dos favoritos');
        }
    };

    return (
        <div className="max-w-2xl mx-auto min-h-screen pb-24 px-4 pt-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-red-500 transition">
                    <ChevronLeft className="w-7 h-7" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-gray-800 leading-none">Favoritos</h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Meus Restaurantes</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
                    <span className="text-gray-400 font-bold text-sm uppercase">Carregando seus favoritos...</span>
                </div>
            ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="bg-gray-50 p-8 rounded-full mb-6">
                        <Heart className="w-16 h-16 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Sem favoritos ainda</h3>
                    <p className="text-gray-400 text-sm max-w-[250px] mb-8">Você ainda não favoritou nenhum restaurante. Explore o mapa!</p>
                    <Link to="/" className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-700 transition">
                        Ver Restaurantes
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {favorites.map((restaurant) => (
                        <Link
                            to={`/restaurant/${restaurant.id}`}
                            key={restaurant.id}
                            className="bg-white rounded-3xl p-4 flex gap-4 border border-gray-100 shadow-sm hover:shadow-md transition group overflow-hidden relative"
                        >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                                <img
                                    src={restaurant.imageUrl || 'https://via.placeholder.com/200x200'}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-bold text-gray-800 truncate pr-4">{restaurant.name}</h3>
                                    <button
                                        onClick={(e) => toggleFavorite(restaurant.id, e)}
                                        className="text-red-500 hover:scale-110 transition active:scale-95"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-1 mb-2">{restaurant.description}</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        <Star className="w-3 h-3 fill-current" /> 4.8
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <Utensils className="w-3 h-3" /> {restaurant.category}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
