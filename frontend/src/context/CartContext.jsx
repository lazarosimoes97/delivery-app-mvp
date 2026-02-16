import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : { restaurantId: null, items: [] };
        } catch (error) {
            console.error('Error parsing cart:', error);
            return { restaurantId: null, items: [] };
        }
    });

    const lastUserId = useRef(user?.id);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Limpar carrinho se o usuário mudar (login/logout)
    useEffect(() => {
        if (user?.id !== lastUserId.current) {
            setCart({ restaurantId: null, items: [] });
            lastUserId.current = user?.id;
        }
    }, [user?.id]);

    const addToCart = (product, quantity, restaurantId) => {
        // Verificar se é de um restaurante diferente antes de entrar no setCart
        if (cart.restaurantId && cart.restaurantId !== restaurantId) {
            if (!window.confirm("Deseja iniciar um novo carrinho? Adicionar itens de um restaurante diferente limpará seu carrinho atual.")) {
                return;
            }
            // Iniciar novo carrinho
            setCart({
                restaurantId,
                items: [{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity
                }]
            });
            return;
        }

        setCart((prevCart) => {
            const currentRestaurantId = restaurantId;
            const newItems = [...prevCart.items];

            const existingItemIndex = newItems.findIndex((item) => item.productId === product.id);
            if (existingItemIndex > -1) {
                newItems[existingItemIndex].quantity += quantity;
            } else {
                newItems.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity
                });
            }

            return { restaurantId: currentRestaurantId, items: newItems };
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => {
            const newItems = prevCart.items.filter((item) => item.productId !== productId);
            return {
                ...prevCart,
                items: newItems,
                restaurantId: newItems.length === 0 ? null : prevCart.restaurantId
            };
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart((prevCart) => {
            const newItems = prevCart.items.map((item) => {
                if (item.productId === productId) {
                    const newQuantity = item.quantity + delta;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);

            return {
                ...prevCart,
                items: newItems,
                restaurantId: newItems.length === 0 ? null : prevCart.restaurantId
            };
        });
    };

    const clearCart = () => {
        setCart({ restaurantId: null, items: [] });
    };

    const cartTotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartItemsCount = cart.items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartItemsCount }}>
            {children}
        </CartContext.Provider>
    );
};
