'use client'
import React from 'react'
import ElectoralDashboard from '@/Components/ElectoralDashboard'
import ZonasElectorales from '@/Components/ZonasElectorales'
import GestionFamilias from '@/Components/GestionFamilias'
import ReportesAnalisis from '@/Components/ReportesAnalisis'
import ConfiguracionPage from '@/Components/ConfiguracionPage'
import GenerarReportesPage from '@/Components/GenerarReportesPage'

function RenderPages({ activePage }) {

    const renderPage = () => {
        switch (activePage) {
            case '/':
                return <ElectoralDashboard />
            case '/zonas-electorales':
                return <ZonasElectorales />
            case '/familias':
                return <GestionFamilias />
            case '/reportes':
                return <ReportesAnalisis />
            case '/configuracion':
                return <ConfiguracionPage />
            case '/reportes-imprimir':
                return <GenerarReportesPage />
            default:
                return <ElectoralDashboard />
        }
    }

    return renderPage()
}

export default RenderPages