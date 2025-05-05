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
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-3">
                Código de verificação
            </label>
            <div className="flex justify-center">
                <OTPInput
                    value={value}
                    onChange={handleChange}
                    numInputs={numInputs}
                    renderSeparator={<span className="mx-1"></span>}
                    renderInput={(props) => (
                        <input
                            {...props}
                            className={`w-12 h-12 text-center text-xl border rounded focus:outline-none
                                ${error ? 'border-red-500 bg-red-50' : 'focus:border-blue-500 border-gray-300'}
                                ${value.length === numInputs && !error ? 'border-green-500 bg-green-50' : ''}
                            `}
                        />
                    )}
                    inputStyle={{
                        width: '3rem',
                        height: '3rem',
                        margin: '0 0.2rem',
                        fontSize: '1.5rem',
                        borderRadius: '0.25rem',
                    }}
                />
            </div>
            {error && (
                <p className="text-red-500 text-xs italic mt-2 text-center">{error}</p>
            )}
            <p className="text-sm text-gray-600 mt-3 text-center">
                Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
            </p>
        </div>
    );
};

export default OTPField;
