import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Search, Star, Clock, MapPin, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const RestaurantMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { addToCart } = useCart();
    const searchInputRef = useRef(null);

    // Refs for category sections to scroll to
    const categoryRefs = useRef({});

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await axios.get(`/restaurants/${id}`);
                setRestaurant(response.data);
                if (response.data.products.length > 0) {
                    // Extract unique categories
                    const categories = [...new Set(response.data.products.map(p => p.category || 'General'))];
                    setActiveCategory(categories[0]);
                }
            } catch (error) {
                console.error('Error fetching restaurant:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [id]);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const scrollToCategory = (category) => {
        setActiveCategory(category);
        if (categoryRefs.current[category]) {
            // Offset for the fixed headers
            const yOffset = -140;
            const element = categoryRefs.current[category];
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;
    }

    if (!restaurant) {
        return <div className="text-center p-8">Restaurante não encontrado</div>;
    }

    // Filter products based on search query
    const filteredProducts = restaurant.products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group products by category
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const category = product.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {});

    const categories = Object.keys(groupedProducts);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sticky top-0 bg-white z-20 border-b border-gray-100 shadow-sm h-[60px]">
                {isSearchOpen ? (
                    <div className="flex items-center w-full">
                        <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-gray-500 mr-2">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar no cardápio"
                            className="flex-1 bg-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                ) : (
                    <>
                        <button onClick={() => navigate(-1)} className="text-red-500">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-sm font-bold text-gray-800 uppercase tracking-wide truncate max-w-[200px]">{restaurant.name}</h1>
                        <button onClick={() => setIsSearchOpen(true)} className="text-red-500">
                            <Search className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Category Tabs */}
            <div className="sticky top-[60px] bg-white z-20 shadow-sm">
                <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => scrollToCategory(category)}
                            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeCategory === category
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Content */}
            <div className="p-4">
                {categories.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        Nenhum produto encontrado.
                    </div>
                ) : (
                    categories.map(category => (
                        <div key={category} ref={el => categoryRefs.current[category] = el} className="mb-8 scroll-mt-32">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{category}</h2>
                            <div className="space-y-6">
                                {groupedProducts[category].map(product => (
                                    <div key={product.id} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                        {/* Text Content */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-base font-medium text-gray-800 mb-1">{product.name}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-base font-medium text-gray-800">R$ {product.price.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Image */}
                                        <div className="relative w-32 h-24 flex-shrink-0">
                                            <img
                                                src={product.imageUrl || 'https://via.placeholder.com/150'}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <AddToOrderButton product={product} restaurantId={restaurant.id} addToCart={addToCart} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const AddToOrderButton = ({ product, restaurantId, addToCart }) => {
    const [added, setAdded] = useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        addToCart(product, 1, restaurantId);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleClick}
            className={`absolute bottom-[-10px] right-[-5px] shadow-md p-1.5 rounded-full border border-gray-100 transition-all duration-300 flex items-center justify-center min-w-[32px] h-[32px] ${added ? 'bg-green-500 text-white scale-110' : 'bg-white text-red-600'
                }`}
        >
            {added ? (
                <Check className="w-5 h-5 animate-in zoom-in duration-300" />
            ) : (
                <Plus className="w-5 h-5" />
            )}

            {added && (
                <span className="absolute -top-8 right-0 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-bounce">
                    Adicionado!
                </span>
            )}
        </button>
    );
};

export default RestaurantMenu;
