using QRCoder;
using System.Text;

namespace MFAApi.Utils;

// Classe adaptada para evitar dependência do System.Drawing que não é bem suportada no .NET mais recente
public class PngByteQRCode
{
    private readonly QRCodeData _qrCodeData;

    public PngByteQRCode(QRCodeData data)
    {
        _qrCodeData = data ?? throw new ArgumentNullException(nameof(data));
    }

    public byte[] GetGraphic(int pixelsPerModule)
    {
        // Converter para base64 string como alternativa - podemos usar no frontend diretamente
        var base64 = GetBase64Image(pixelsPerModule);
        return Convert.FromBase64String(base64);
    }

    public string GetBase64Image(int pixelsPerModule)
    {
        // Implementação sem dependência de System.Drawing
        var svgQRCode = new SvgQRCode(_qrCodeData);
        string svgString = svgQRCode.GetGraphic(pixelsPerModule);

        // Convertendo SVG para base64
        var bytes = Encoding.UTF8.GetBytes(svgString);
        var base64 = Convert.ToBase64String(bytes);

        return base64;
    }
}
