import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Search = () => {
    const [query, setQuery] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await axios.get('/restaurants'); // This returns restaurants WITH products
                setRestaurants(response.data);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(query.toLowerCase())
    );

    // Find products that match the query
    const filteredProducts = [];
    if (query) {
        restaurants.forEach(restaurant => {
            if (restaurant.products) {
                restaurant.products.forEach(product => {
                    if (product.name.toLowerCase().includes(query.toLowerCase()) ||
                        product.description.toLowerCase().includes(query.toLowerCase())) {
                        filteredProducts.push({ ...product, restaurantName: restaurant.name, restaurantId: restaurant.id });
                    }
                });
            }
        });
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;
    }

    return (
        <div className="pb-20">
            {/* Search Input */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm shadow-sm"
                    placeholder="Buscar por restaurantes ou pratos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            {!query ? (
                // Empty State / Suggestions
                <div className="text-center text-gray-500 mt-12">
                    <SearchIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Digite para buscar sua comida favorita.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Restaurants Results */}
                    {filteredRestaurants.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Restaurantes</h2>
                            <div className="space-y-4">
                                {filteredRestaurants.map(restaurant => (
                                    <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                        <img
                                            src={restaurant.imageUrl || 'https://via.placeholder.com/100'}
                                            alt={restaurant.name}
                                            className="w-16 h-16 rounded-md object-cover mr-4"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{restaurant.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-1">{restaurant.description}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products Results */}
                    {filteredProducts.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Pratos</h2>
                            <div className="space-y-4">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex gap-3">
                                        {product.imageUrl && (
                                            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-md object-cover flex-shrink-0 bg-gray-100" />
                                        )}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">em {product.restaurantName}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-red-600 text-sm">R$ {product.price.toFixed(2)}</span>
                                                <Link
                                                    to={`/restaurant/${product.restaurantId}`}
                                                    className="text-xs text-red-600 font-medium hover:underline"
                                                >
                                                    Ver
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredRestaurants.length === 0 && filteredProducts.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Nenhum resultado encontrado para "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
