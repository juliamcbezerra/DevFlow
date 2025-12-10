export const getEmailTemplate = (
  title: string, 
  message: string, 
  highlight: string, // Pode ser um Link (Botão) ou um Código (Texto Grande)
  isCode: boolean = false // Define se renderiza botão ou código
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; margin: 0; padding: 0; color: #e4e4e7; }
    .container { max-width: 500px; margin: 40px auto; background-color: #18181b; border-radius: 24px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .header { background-color: #18181b; padding: 40px 0 20px 0; text-align: center; border-bottom: 1px solid #27272a; }
    .logo { font-size: 28px; font-weight: 800; color: white; letter-spacing: -1px; display: inline-block; }
    .logo span { color: #8b5cf6; } /* Violet-500 */
    .content { padding: 40px 30px; text-align: center; }
    h1 { color: #f4f4f5; font-size: 24px; margin-bottom: 16px; font-weight: 700; letter-spacing: -0.5px; }
    p { color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
    
    /* Estilo do Botão */
    .btn { 
      display: inline-block; 
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); 
      color: #ffffff !important; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 12px; 
      font-weight: 700; 
      font-size: 16px; 
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
      transition: all 0.2s;
    }
    
    /* Estilo do Código OTP */
    .code-box {
      background-color: #27272a;
      color: #a78bfa;
      font-family: 'Courier New', monospace;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      padding: 20px;
      border-radius: 12px;
      border: 1px dashed #4c1d95;
      display: inline-block;
      margin: 10px 0;
    }

    .footer { padding: 30px; text-align: center; font-size: 12px; color: #52525b; background-color: #09090b; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Dev<span>Flow</span></div>
    </div>
    <div class="content">
      <h1>${title}</h1>
      <p>${message}</p>
      
      ${isCode 
        ? `<div class="code-box">${highlight}</div>` 
        : `<a href="${highlight}" target="_blank" class="btn">Verificar E-mail</a>`
      }
      
      ${!isCode ? `<p style="margin-top: 30px; font-size: 12px; color: #52525b;">Ou cole este link no navegador: <br/><span style="color:#71717a">${highlight}</span></p>` : ''}
    </div>
    <div class="footer">
      <p style="margin:0">© 2025 DevFlow Security.<br>Enviado automaticamente, não responda.</p>
    </div>
  </div>
</body>
</html>
`;