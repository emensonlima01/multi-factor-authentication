import { useCallback, useEffect, useState } from 'react';
import OTPInput from 'react-otp-input';

interface OTPFieldProps {
    value: string;
    onChange: (otp: string) => void;
    onComplete?: (otp: string) => void;
    numInputs?: number;
    error?: string;
    autoSubmit?: boolean;
}

const OTPField = ({
    value,
    onChange,
    onComplete,
    numInputs = 6,
    error,
    autoSubmit = true
}: OTPFieldProps) => {
    const [lastSubmittedValue, setLastSubmittedValue] = useState("");
    const [inputWidth, setInputWidth] = useState(48); // Largura padrão em pixels

    // Ajusta o tamanho dos inputs de acordo com o tamanho da tela
    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth < 360) {
                setInputWidth(36); // Muito pequeno para dispositivos menores
            } else if (screenWidth < 480) {
                setInputWidth(40); // Pequeno para dispositivos móveis
            } else if (screenWidth < 768) {
                setInputWidth(44); // Médio para tablets
            } else {
                setInputWidth(48); // Padrão para desktops
            }
        };

        // Define o tamanho inicial
        handleResize();

        // Adiciona evento de redimensionamento
        window.addEventListener('resize', handleResize);

        // Limpa o evento ao desmontar o componente
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleChange = useCallback((otp: string) => {
        onChange(otp);

        // Se o OTP estiver completo e onComplete for fornecido, chame-o
        if (autoSubmit && otp.length === numInputs && onComplete && otp !== lastSubmittedValue) {
            setLastSubmittedValue(otp);
            onComplete(otp);
        }
    }, [onChange, onComplete, numInputs, lastSubmittedValue, autoSubmit]);

    // Limpar o último valor submetido quando o erro for limpo
    useEffect(() => {
        if (!error && lastSubmittedValue) {
            setLastSubmittedValue("");
        }
    }, [error]);

    return (
        <div className="mb-6 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-3 text-center">
                Código de verificação
            </label>
            <div className="flex justify-center">
                <OTPInput
                    value={value}
                    onChange={handleChange}
                    numInputs={numInputs}
                    renderSeparator={<span className="mx-[2px] sm:mx-1"></span>}
                    renderInput={(props) => (
                        <input
                            {...props}
                            className={`text-center text-xl border rounded focus:outline-none
                                ${error ? 'border-red-500 bg-red-50' : 'focus:border-blue-500 border-gray-300'}
                                ${value.length === numInputs && !error ? 'border-green-500 bg-green-50' : ''}
                            `}
                            style={{ width: `${inputWidth}px`, height: `${inputWidth}px`, fontSize: `${Math.max(inputWidth / 3, 16)}px` }}
                        />
                    )}
                />
            </div>
            {error && (
                <p className="text-red-500 text-xs italic mt-2 text-center">{error}</p>
            )}
            <p className="text-sm text-gray-600 mt-3 text-center px-2">
                Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
            </p>
        </div>
    );
};

export default OTPField;
