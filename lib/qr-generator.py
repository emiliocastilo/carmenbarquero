import qrcode
from PIL import Image

url = "https://www.carmenbarqueropsicologia.es/reserva-cita"
qr = qrcode.QRCode(version=1, box_size=10, border=5)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="black", back_color="white")
img.save("qr_code.png")
print("QR code generated successfully.")