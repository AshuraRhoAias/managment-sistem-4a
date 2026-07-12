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
  const [isRegister, setIsRegister] = useState(false)
  const { login, register } = useAuth()

  const handleLoginSubmit = async (e) => {
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target)
    const nombre = formData.get('nombre')
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const secretPhrase = formData.get('secretPhrase')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    const result = await register(nombre, email, password, secretPhrase)

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
            <p className="login-subtitle">
              {isRegister ? 'Crea una nueva cuenta' : 'Inicia sesión para continuar'}
            </p>
          </div>

          {!isRegister ? (
            <form className="login-form" onSubmit={handleLoginSubmit}>
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
          ) : (
            <form className="login-form" onSubmit={handleRegisterSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="nombre">
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className="form-input"
                  placeholder="Juan Pérez"
                  required
                  autoComplete="name"
                />
              </div>

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
                  autoComplete="new-password"
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="secretPhrase">
                  Frase Secreta de Registro *
                </label>
                <input
                  id="secretPhrase"
                  name="secretPhrase"
                  type="password"
                  className="form-input"
                  placeholder="Ingresa la frase secreta"
                  required
                  autoComplete="off"
                />
                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  * Esta frase es requerida para crear nuevos usuarios en el sistema
                </small>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </form>
          )}

          <div className="login-footer">
            {!isRegister ? (
              <>
                ¿No tienes una cuenta?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); setError(''); }}>
                  Registrarse
                </a>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); setError(''); }}>
                  Iniciar Sesión
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage