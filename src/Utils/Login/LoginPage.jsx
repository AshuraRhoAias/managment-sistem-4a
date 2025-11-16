'use client'
import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import css from './Css'

// ============================================
// 🏠 COMPONENTE PRINCIPAL: LOGIN PAGE
// ============================================
function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    const result = await login(email, password)

    if (!result.success) {
      setError(result.message)
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Management System</h1>
            <p className="login-subtitle">Inicia sesión para continuar</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="usuario@ejemplo.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-footer">
            ¿Olvidaste tu contraseña? <a href="#">Recuperar</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage