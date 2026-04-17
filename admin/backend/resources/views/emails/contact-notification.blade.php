<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo mensaje de contacto</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">Nuevo mensaje de contacto</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p><strong>Nombre:</strong> {{ $name }}</p>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Mensaje:</strong></p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 4px; margin-top: 10px;">
                {{ $msg }}
            </div>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Este mensaje fue enviado desde el formulario de contacto de Studio Vimana.
        </p>
    </div>
</body>
</html>
