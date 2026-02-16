import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, User, Mail, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const EditProfile = () => {
    const { user, login } = useAuth(); // We can use login to refresh local state if needed, or just axios
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await axios.put('/users/profile', formData);
            // Update local storage user data
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...storedUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Note: Our AuthContext uses state. Since we don't have a 'refreshUser' in context,
            // the user might need to reload or we'd need to add that. 
            // For now, let's assume AuthContext might need a small update to handle this.

            setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });
            setTimeout(() => navigate('/profile'), 1500);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.error || 'Erro ao atualizar perfil'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white md:bg-gray-50 md:py-8">
            <div className="bg-white md:rounded-3xl md:shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-gray-100 bg-gray-50/50">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-red-500 transition">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="flex-1 text-center font-bold text-gray-800 text-lg uppercase tracking-wider">Meus Dados</h2>
                    <div className="w-6"></div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {status.message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="text-sm font-medium">{status.message}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Nome Completo</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-gray-800 font-medium"
                                    placeholder="Seu nome"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-gray-800 font-medium"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 shadow-lg shadow-red-100 hover:bg-red-700 transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? (
                                <div className="animate-spin h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Salvar Alterações</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
