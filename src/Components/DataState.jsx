import React from 'react'

// Muestra "cargando" o el error (con reintento) en lugar del contenido mientras los datos no estén listos.
const box = {
    padding: '32px',
    textAlign: 'center',
    borderRadius: '12px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    color: '#6b7280',
    marginBottom: '24px',
}

export default function DataState({ loading, error, onRetry, children }) {
    if (loading) return <div style={box}>Cargando datos...</div>

    if (error) {
        return (
            <div style={{ ...box, color: '#991b1b', backgroundColor: '#fef2f2' }}>
                <p style={{ margin: '0 0 12px 0' }}>{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#991b1b', color: 'white', cursor: 'pointer' }}
                    >
                        Reintentar
                    </button>
                )}
            </div>
        )
    }

    return <>{children}</>
}
