'use client'
import React, { useState, createContext, useContext, useEffect } from 'react'
import CookieManager from './CookieManager'
import SecureStorage from './SecureStorage'
import apiClient from './apiClient'

// ============================================
// 🔐 AUTH CONTEXT
// ============================================
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = CookieManager.get('auth_token')
            const storedUser = SecureStorage.getUser()

            if (storedToken && storedUser) {
                // Verificar que el token aún sea válido
                const result = await apiClient.verifyToken()

                if (result.success) {
                    setToken(storedToken)
                    setUser(storedUser)
                    setIsAuthenticated(true)
                } else {
                    // Token inválido, limpiar todo
                    CookieManager.clearAll()
                    SecureStorage.removeUser()
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    const login = async (email, password) => {
        try {
            const result = await apiClient.login(email, password)

            if (!result.success) {
                return {
                    success: false,
                    message: result.error
                }
            }

            const { token, refreshToken, usuario } = result.data

            // Guardar todo en cookies (persistente)
            CookieManager.set('auth_token', token, 1) // 1 día
            CookieManager.set('refresh_token', refreshToken, 7) // 7 días
            SecureStorage.setUser(usuario) // Ahora usa cookies

            setToken(token)
            setUser(usuario)
            setIsAuthenticated(true)

            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: 'Error al conectar con el servidor'
            }
        }
    }

    const register = async (nombre, email, password) => {
        try {
            const result = await apiClient.register(nombre, email, password)

            if (!result.success) {
                return {
                    success: false,
                    message: result.error
                }
            }

            const { token, refreshToken, usuario } = result.data

            CookieManager.set('auth_token', token, 1)
            CookieManager.set('refresh_token', refreshToken, 7)
            SecureStorage.setUser(usuario)

            setToken(token)
            setUser(usuario)
            setIsAuthenticated(true)

            return { success: true }
        } catch (error) {
            return {
                success: false,
                message: 'Error al conectar con el servidor'
            }
        }
    }

    const logout = () => {
        CookieManager.clearAll()
        SecureStorage.removeUser()

        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
    }

    const decryptPassword = async (masterPhrase) => {
        if (!user) return { success: false, message: 'No hay usuario autenticado' }

        try {
            const result = await apiClient.decryptPassword(user.id, masterPhrase)

            if (!result.success) {
                return {
                    success: false,
                    message: result.error
                }
            }

            return {
                success: true,
                decryptedPassword: result.data.decryptedPassword
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error al descifrar password'
            }
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated,
            login,
            logout,
            register,
            decryptPassword
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}