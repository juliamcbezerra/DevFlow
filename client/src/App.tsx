import React from 'react'
import Button from './components/Button'

export default function App() {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '24px' }}>
      <Button label="Converter em Tarefa" variant="primary" />
      <Button label="Ver Detalhes" variant="secondary" />
    </div>
  )
}
