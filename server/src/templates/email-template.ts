export const getEmailTemplate = (title: string, message: string, actionLink: string, actionText: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; margin: 0; padding: 0; color: #e4e4e7; }
    .container { max-width: 600px; margin: 40px auto; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; color: white; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; text-align: center; }
    h1 { color: #f4f4f5; font-size: 22px; margin-bottom: 16px; }
    p { color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
    .btn { display: inline-block; background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; transition: background 0.2s; }
    .btn:hover { background-color: #6d28d9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">DevFlow</div>
    </div>
    <div class="content">
      <h1>${title}</h1>
      <p>${message}</p>
      <a href="${actionLink}" class="btn">${actionText}</a>
    </div>
    <div class="footer">
      <p style="margin:0">© 2025 DevFlow. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;