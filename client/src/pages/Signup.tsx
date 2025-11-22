import { SignupForm } from "../components/auth/signup-form"

export default function SignupPage() {
  // callback para quando o formulario e submetido com dados validados
  const handleSignup = async (dados: any) => {
    try {
      console.log("enviando cadastro para backend:", dados)
      
      // aqui eu faria a chamada para a api do backend
      // exemplo:
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dados)
      // })
      // const resultado = await response.json()
      // if (response.ok) {
      //   // redirecionar para login ou dashboard
      //   window.location.href = '/login'
      // } else {
      //   // exibir erro
      // }
    } catch (erro) {
      console.error("erro ao cadastrar:", erro)
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
    className="signup-container">
      {/*coluna esquerda com formulario*/}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(20px, 5vw, 40px)',
        backgroundColor: '#1a1a2e',
        overflow: 'hidden'
      }}
      className="signup-left">
        <div style={{
          width: '100%',
          maxWidth: '400px'
        }}>
          <SignupForm onSubmit={handleSignup} />
        </div>
      </div>

      {/*coluna direita com imagem e gradiente*/}
      <div style={{
        backgroundImage: 'linear-gradient(135deg, #e91e63 0%, #c71585 25%, #9c27b0 50%, #ff8c00 75%, #ffa500 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="signup-right">
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
        
        {/*local pra adicionar imagem ou conteudo*/}
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
            }}>gerencie seus projetos com facilidade</p>
          </div>
        </div>
      </div>
    </div>
  )
}
