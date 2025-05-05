import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <Button variant="secondary" onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-6">
                        <h2 className="text-2xl font-semibold mb-4">Bem-vindo, {user?.name || 'Usuário'}!</h2>
                        <p className="text-gray-600">
                            Você está autenticado com sucesso utilizando a autenticação multifator.
                        </p>
                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-2">Seus dados:</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><span className="font-semibold">Nome:</span> {user?.name}</li>
                                <li><span className="font-semibold">Email:</span> {user?.email}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
