import React from 'react'
import Botao from './components/Botao'
import Input from './components/Input'

export default function App() {
  const [texto, setTexto] = React.useState("")

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '24px', width: '100%', maxWidth: '600px' }}>
      <Botao label="Converter em Tarefa" variant="primario" />
      <Botao label="Ver Detalhes" variant="secundario" />

      <Input 
        placeholder="Digite algo..." 
        value={texto} 
        onChange={(e) => setTexto(e.target.value)} 
      />
    </div>
  )
}
