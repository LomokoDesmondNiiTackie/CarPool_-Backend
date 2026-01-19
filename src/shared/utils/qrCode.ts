import crypto from 'crypto';
import QRCode from 'qrcode';

const generateQRToken = async (bookingId: string): Promise<{ token: string; qrImage: string }> => {
  const payload = `${bookingId}-${Date.now()}`;
  const token = crypto.createHash('sha256').update(payload).digest('hex').substring(0, 32);
  const qrImage = await QRCode.toDataURL(token);
  
  return { token, qrImage };
};

export { generateQRToken };