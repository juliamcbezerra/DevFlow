import * as loginForm from "../components/auth/login-form"

export default function LoginPage() {
  // callback para quando o formulario é submetido com dados validados
  const handleLogin = async (dados: any) => {
    try {
      console.log("enviando login para backend:", dados)
      
      // aqui eu faria a chamada para a api do backend
      // exemplo:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dados)
      // })
      // const resultado = await response.json()
      // if (response.ok) {
      //   // redirecionar para dashboard
      //   window.location.href = '/dashboard'
      // } else {
      //   // exibir erro
      // }
    } catch (erro) {
      console.error("erro ao fazer login:", erro)
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      width: '100vw',
      height: '100vh',
      background: '#1a1a2e',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0
    }}
    className="login-container">
      {/*coluna esquerda com imagem e gradiente*/}
      <div style={{
        backgroundImage: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 25%, #9c27b0 50%, #c71585 75%, #e91e63 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="login-left">
        {/*padrao de ondas em background*/}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.1) 10px,
              rgba(255, 255, 255, 0.1) 20px
            )
          `,
          pointerEvents: 'none'
        }} />
        
        {/*local para adicionar imagem ou conteudo*/}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            color: 'white',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '8px'
            }}>
              <span style={{ color: 'white' }}>Dev</span>
              <span style={{ color: '#ffd700', fontStyle: 'italic' }}>Flow</span>
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0
            }}>faça login em sua conta</p>
          </div>
        </div>
      </div>

      {/*coluna direita com formulario*/}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(20px, 5vw, 40px)',
        backgroundColor: '#1a1a2e',
        overflow: 'hidden'
      }}
      className="login-right">
        <div style={{
          width: '100%',
          maxWidth: '400px'
        }}>
          <loginForm.LoginForm onSubmit={handleLogin} />
        </div>
      </div>
    </div>
  )
}
