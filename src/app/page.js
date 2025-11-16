'use client'
import React, { useState, useEffect, useRef } from 'react'
import RenderPages from '@/Utils/RenderPages'
import LoginPage from '@/Utils/Login/LoginPage'
import { useAuth } from '@/Utils/Login/AuthContext' // ← AGREGAR ESTA LÍNEA
import { FaHome, FaPrint } from "react-icons/fa";
import { CiMap } from "react-icons/ci";
import { MdPeopleAlt } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { IoSettings, IoClose } from "react-icons/io5";
import { HiMenuAlt3 } from "react-icons/hi";

function Page() {
  const [activePage, setActivePage] = useState('/')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const headerRef = useRef(null)
  const { isAuthenticated, user, logout, loading } = useAuth()

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target) && isExpanded) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className='Container'>
      <header
        ref={headerRef}
        className={`header ${isExpanded ? 'expanded' : 'collapsed'} ${isMobile ? 'mobile' : ''}`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        {/* Botón hamburguesa para mobile */}
        {isMobile && !isExpanded && (
          <button
            className="menu-toggle"
            onClick={() => setIsExpanded(true)}
          >
            <HiMenuAlt3 size={24} />
          </button>
        )}

        {/* Botón cerrar para mobile cuando está expandido */}
        {isMobile && isExpanded && (
          <button
            className="close-btn-mobile"
            onClick={() => setIsExpanded(false)}
          >
            <IoClose size={24} />
          </button>
        )}

        <section className="header-content">
          <h1 className={isExpanded ? 'show' : 'hide'}>Management System</h1>
          <span className={`nameUser ${isExpanded ? 'show' : 'hide'}`}>
            Bienvenido, {user?.nombre || user?.email}
          </span>
        </section>

        <nav>
          <BtnHeader
            icon={<FaHome />}
            text="Home"
            page="/"
            activePage={activePage}
            setActivePage={setActivePage}
            isExpanded={isExpanded}
            onClick={() => isMobile && setIsExpanded(false)}
          />

          <BtnHeader
            icon={<CiMap />}
            text="Zonas Electorales"
            page="/zonas-electorales"
            activePage={activePage}
            setActivePage={setActivePage}
            isExpanded={isExpanded}
            onClick={() => isMobile && setIsExpanded(false)}
          />

          <BtnHeader
            icon={<MdPeopleAlt />}
            text="Familias"
            page="/familias"
            activePage={activePage}
            setActivePage={setActivePage}
            isExpanded={isExpanded}
            onClick={() => isMobile && setIsExpanded(false)}
          />

          <BtnHeader
            icon={<TbReportAnalytics />}
            text="Reportes"
            page="/reportes"
            activePage={activePage}
            setActivePage={setActivePage}
            isExpanded={isExpanded}
            onClick={() => isMobile && setIsExpanded(false)}
          />

          <BtnHeader
            icon={<IoSettings />}
            text="Configuracion"
            page="/configuracion"
            activePage={activePage}
            setActivePage={setActivePage}
            isExpanded={isExpanded}
            onClick={() => isMobile && setIsExpanded(false)}
          />

          <BtnHeader
            icon={<FaPrint />}
            text="Reportes Imprimir"
            page="/reportes-imprimir"
            activePage={activePage}
            setActivePage={setActivePage}
            isExpanded={isExpanded}
            onClick={() => isMobile && setIsExpanded(false)}
          />
        </nav>

        <section className="user-info">
          <button
            className={`logout-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
            onClick={logout}
          >
            {isExpanded ? 'Cerrar Sesión' : '×'}
          </button>
        </section>
      </header>

      <main>
        <section className="page-view">
          <RenderPages activePage={activePage} />
        </section>
      </main>
    </div>
  )
}

function BtnHeader({ icon, text, page, setActivePage, activePage, isExpanded, onClick }) {
  return (
    <button
      className={activePage === page ? "active" : ""}
      onClick={() => {
        setActivePage(page)
        onClick && onClick()
      }}
      title={!isExpanded ? text : ''}
    >
      <span className="icon">{icon}</span>
      <span className={`text ${isExpanded ? 'show' : 'hide'}`}>{text}</span>
    </button>
  )
}

export default Page