import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import LocationModal from '../components/LocationModal';
import CategoryCarousel from '../components/CategoryCarousel';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { location, address } = useLocation();
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    useEffect(() => {
        if (!location) {
            setIsLocationModalOpen(true);
        }
    }, [location]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await axios.get('/restaurants');
                setRestaurants(response.data);
            } catch (err) {
                setError('Falha ao carregar restaurantes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) return <div className="text-center py-10">Carregando...</div>;
    if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

    return (
        <div className="pb-20"> {/* Add padding bottom for mobile if we had bottom nav, or just general spacing */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Restaurantes</h2>
                <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition bg-white md:bg-transparent p-2 md:p-0 rounded-lg shadow-sm md:shadow-none border md:border-none border-gray-100"
                >
                    <MapPin className="w-4 h-4 text-red-500 md:text-gray-600" />
                    {address ? <span className="truncate max-w-[200px] font-medium">{address}</span> : 'Selecionar Localização'}
                </button>
            </div>

            <CategoryCarousel />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {restaurants.map((restaurant) => (
                    <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id} className="block group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            <div className="relative h-40 md:h-48 overflow-hidden">
                                <img
                                    src={restaurant.imageUrl || 'https://via.placeholder.com/400x200'}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:hidden">
                                    <h3 className="text-white font-bold text-lg leading-tight">{restaurant.name}</h3>
                                </div>
                            </div>
                            <div className="p-3 md:p-4">
                                <h3 className="hidden md:block text-lg font-semibold mb-1">{restaurant.name}</h3>
                                <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">{restaurant.description}</p>
                                <div className="flex items-center text-xs md:text-sm text-gray-500">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="truncate">{restaurant.address}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
            />
        </div>
    );
};


export default RestaurantList;
