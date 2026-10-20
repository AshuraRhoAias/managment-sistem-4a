import React from 'react'

// Barra de pestañas simple: tabs = [{ id, label }]
export default function TabBar({ tabs, active, onChange }) {
    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {tabs.map((tab) => {
                const isActive = tab.id === active
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        style={{
                            padding: '10px 18px',
                            border: '1px solid',
                            borderColor: isActive ? '#2563eb' : '#e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: isActive ? '#2563eb' : 'white',
                            color: isActive ? 'white' : '#374151',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
