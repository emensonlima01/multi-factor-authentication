import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface MFASetupProps {
    qrCodeUrl: string;
    secret?: string;
    onError?: (error: string) => void;
}

const MFASetup = ({ qrCodeUrl, secret, onError }: MFASetupProps) => {
    const [imageError, setImageError] = useState<boolean>(false);

    // Verifica se o QR code é uma URL base64 ou uma string normal
    const isBase64Image = qrCodeUrl.startsWith('data:image');

    // Verificar se a URL do QR code é válida
    useEffect(() => {
        if (!qrCodeUrl) {
            setImageError(true);
            if (onError) onError("QR Code não disponível. Tente atualizar a página.");
        } else {
            setImageError(false);
        }
    }, [qrCodeUrl, onError]);

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Configure a Autenticação de Dois Fatores
            </h3>

            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                {imageError ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-200 text-gray-500">
                        Erro ao carregar QR Code
                    </div>
                ) : isBase64Image ? (
                    <img
                        src={qrCodeUrl}
                        alt="QR Code para autenticação"
                        width={200}
                        height={200}
                        onError={() => {
                            setImageError(true);
                            if (onError) onError("Falha ao carregar a imagem do QR Code.");
                        }}
                    />
                ) : (
                    <QRCodeCanvas
                        value={qrCodeUrl}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                        includeMargin={false}
                    />
                )}
            </div>

            <div className="text-sm text-gray-600 mb-4 max-w-md text-center">
                <p className="mb-2">
                    Escaneie o QR Code acima com um aplicativo autenticador como Google Authenticator,
                    Microsoft Authenticator ou Authy para configurar a autenticação de dois fatores.
                </p>

                {secret && (
                    <div className="mt-4">
                        <p className="font-semibold mb-1">Ou insira este código manualmente:</p>
                        <code className="bg-gray-200 px-2 py-1 rounded">{secret}</code>
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-500 text-center max-w-md">
                <p>
                    A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
                    Após configurar, você precisará fornecer um código de verificação gerado pelo aplicativo
                    autenticador sempre que fizer login.
                </p>
            </div>
        </div>
    );
};

export default MFASetup;
