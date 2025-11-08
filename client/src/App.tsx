import React from 'react'
import Botao from './components/Botao'

export default function App() {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '24px' }}>
      <Botao label="Converter em Tarefa" variant="primario" />
      <Botao label="Ver Detalhes" variant="secundario" />
    </div>
  )
}
