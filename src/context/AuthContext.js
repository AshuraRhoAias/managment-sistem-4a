'use client'
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState(() => {
        if (typeof window === 'undefined') {
            return { isAuthenticated: false, user: null }
        }

        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        return {
            isAuthenticated: !!(token && userData),
            user: userData ? JSON.parse(userData) : null
        }
    })

    const login = async (formData) => {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                body: formData // ✅ Enviando FormData (toon) en lugar de JSON
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                setAuthState({
                    isAuthenticated: true,
                    user: data.user
                })
                return { success: true }
            } else {
                return { success: false, message: data.message || 'Error al iniciar sesión' }
            }
        } catch (error) {
            console.error('Error:', error)
            return { success: false, message: 'Error de conexión con el servidor' }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setAuthState({
            isAuthenticated: false,
            user: null
        })
    }

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider')
    }
    return context
}