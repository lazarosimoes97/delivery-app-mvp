import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, ChevronRight } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('CLIENT'); // CLIENT or RESTAURANT_OWNER
    const [step, setStep] = useState(1); // 1: Choose Role, 2: Fill Form
    const [loading, setLoading] = useState(false);

    // User Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Restaurant Data
    const [restaurantName, setRestaurantName] = useState('');
    const [document, setDocument] = useState('');
    const [type, setType] = useState('Restaurante');
    const [category, setCategory] = useState('Geral');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');

    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelection = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = {
                name,
                email,
                password,
                role
            };

            if (role === 'RESTAURANT_OWNER') {
                userData.restaurant = {
                    name: restaurantName,
                    document,
                    type,
                    category,
                    description,
                    address
                };
            }

            const result = await register(userData);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Erro ao criar conta');
            }
        } catch (err) {
            setError(err.message || 'Erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
                <div className="max-w-2xl w-full">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Como você deseja usar o app?</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <button
                            onClick={() => handleRoleSelection('CLIENT')}
                            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-red-500 group text-left"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <User className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quero Pedir</h3>
                            <p className="text-gray-600 mb-4">Encontre seus restaurantes favoritos e receba em casa.</p>
                            <div className="flex items-center text-red-600 font-medium">
                                Criar conta de usuário <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </button>

                        <button
                            onClick={() => handleRoleSelection('RESTAURANT_OWNER')}
                            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-blue-500 group text-left"
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Store className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quero Vender</h3>
                            <p className="text-gray-600 mb-4">Gerencie seu restaurante, cardápio e receba pedidos.</p>
                            <div className="flex items-center text-blue-600 font-medium">
                                Cadastrar meu restaurante <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </button>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-gray-600">
                            Já tem uma conta? <Link to="/login" className="text-red-600 hover:underline font-medium">Fazer Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                <button
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-700 mb-6 flex items-center text-sm"
                >
                    ← Voltar para seleção
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {role === 'CLIENT' ? 'Criar Conta de Usuário' : 'Cadastrar Restaurante'}
                </h2>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Seção de Dados de Acesso */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Dados de Acesso</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 text-sm font-medium mb-2">Senha</label>
                                <input
                                    type="password"
                                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="********"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção de Dados do Restaurante (Apenas para donos) */}
                    {role === 'RESTAURANT_OWNER' && (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 mt-8">Dados do Estabelecimento</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Nome do Estabelecimento</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={restaurantName}
                                        onChange={(e) => setRestaurantName(e.target.value)}
                                        required
                                        placeholder="Ex: Pizzaria do João"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">CPF / CNPJ</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={document}
                                        onChange={(e) => setDocument(e.target.value)}
                                        required
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Tipo de Estabelecimento</label>
                                    <select
                                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="Restaurante">Restaurante</option>
                                        <option value="Lanchonete">Lanchonete</option>
                                        <option value="Mercado">Mercado</option>
                                        <option value="Farmácia">Farmácia</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Categoria Principal</label>
                                    <select
                                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Geral">Geral</option>
                                        <option value="Pizza">Pizza</option>
                                        <option value="Hambúrguer">Hambúrguer</option>
                                        <option value="Japonesa">Japonesa</option>
                                        <option value="Brasileira">Brasileira</option>
                                        <option value="Italiana">Italiana</option>
                                        <option value="Doces & Bolos">Doces & Bolos</option>
                                        <option value="Açaí">Açaí</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Endereço Completo</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                        placeholder="Rua, Número, Bairro, Cidade - UF"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Descrição</label>
                                    <textarea
                                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        placeholder="Uma breve descrição do seu negócio..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${role === 'CLIENT'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
