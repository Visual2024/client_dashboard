// context/ApiContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiContextType {
    data: Date | null; 
    loading: boolean;
    error: string | null;
}

// Creamos el contexto con un valor inicial
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Definimos las props para el provider
interface ApiProviderProps {
    children: ReactNode;
}

// Creamos el provider
export const ApiProvider = ({ children }: ApiProviderProps) => {
    const [data, setData] = useState<Date | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch('https://api.deepseek.com');
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <ApiContext.Provider value={{ data, loading, error }}>
            {children}
        </ApiContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useApi = () => {
    const context = useContext(ApiContext);
    if (context === undefined) {
        throw new Error('useApi debe usarse dentro de un ApiProvider');
    }
    return context;
};