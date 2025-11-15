'use client'
import React, { useState } from 'react'
import RenderPages from '@/Utils/RenderPages'
import { useAuth } from '@/context/AuthContext'
import LoginPage from '@/Utils/Login/LoginPage'

function Page() {
  const [activePage, setActivePage] = useState('/')
  const { isAuthenticated, user, logout } = useAuth()

  // ✅ Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // ✅ Mostrar la aplicación si está autenticado
  return (
    <div className='Container'>
      <header>
        <div className="header-content">
          <h1>Management System</h1>
          <div className="user-info">
            <span>Bienvenido, {user?.name || user?.email}</span>
            <button className="logout-btn" onClick={logout}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <nav>
          <BtnHeader
            text="Home"
            page="/"
            activePage={activePage}
            setActivePage={setActivePage}
          />

          <BtnHeader
            text="Zonas Electorales"
            page="/zonas-electorales"
            activePage={activePage}
            setActivePage={setActivePage}
          />

          <BtnHeader
            text="Familias"
            page="/familias"
            activePage={activePage}
            setActivePage={setActivePage}
          />

          <BtnHeader
            text="Reportes"
            page="/reportes"
            activePage={activePage}
            setActivePage={setActivePage}
          />

          <BtnHeader
            text="Configuracion"
            page="/configuracion"
            activePage={activePage}
            setActivePage={setActivePage}
          />

          <BtnHeader
            text="Reportes Imprimir"
            page="/reportes-imprimir"
            activePage={activePage}
            setActivePage={setActivePage}
          />
        </nav>
      </header>

      <main>
        <section className="page-view">
          <RenderPages activePage={activePage} />
        </section>
      </main>

      <style jsx>{`
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info span {
          font-size: 14px;
          color: #374151;
        }

        .logout-btn {
          padding: 8px 16px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .logout-btn:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  )
}

function BtnHeader({ text, page, setActivePage, activePage }) {
  return (
    <button
      className={activePage === page ? "active" : ""}
      onClick={() => setActivePage(page)}
    >
      {text}
    </button>
  )
}

export default Page