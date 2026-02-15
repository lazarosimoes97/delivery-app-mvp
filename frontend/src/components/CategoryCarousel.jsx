import { useRef } from 'react';
import {
    Sandwich,
    Pizza,
    UtensilsCrossed,
    Beef,
    Coffee,
    IceCream,
    Carrot,
    Beer,
    ChevronLeft,
    ChevronRight,
    Utensils
} from 'lucide-react';

const categories = [
    { id: 1, name: 'Lanches', icon: Sandwich, color: 'bg-orange-100 text-orange-600' },
    { id: 2, name: 'Pizza', icon: Pizza, color: 'bg-red-100 text-red-600' },
    { id: 3, name: 'Japonesa', icon: UtensilsCrossed, color: 'bg-red-50 text-red-500' },
    { id: 4, name: 'Brasileira', icon: Utensils, color: 'bg-yellow-100 text-yellow-600' },
    { id: 5, name: 'Saudável', icon: Carrot, color: 'bg-green-100 text-green-600' },
    { id: 6, name: 'Sobremesas', icon: IceCream, color: 'bg-pink-100 text-pink-600' },
    { id: 7, name: 'Bebidas', icon: Beer, color: 'bg-blue-100 text-blue-600' },
    { id: 8, name: 'Café', icon: Coffee, color: 'bg-brown-100 text-amber-700' },
    { id: 9, name: 'Carnes', icon: Beef, color: 'bg-red-100 text-red-800' },
];

const CategoryCarousel = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 200;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="relative mb-8 group">
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm ${category.color}`}>
                            <category.icon className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{category.name}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
};

export default CategoryCarousel;
