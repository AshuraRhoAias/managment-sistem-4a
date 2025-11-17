export const css = `
    .search-container {
      position: relative;
      margin-bottom: 32px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }

    .search-container.focused {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
      width: 20px;
      height: 20px;
    }
    
    .search-input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      border: none;
      font-size: 15px;
      outline: none;
      color: #1f2937;
      background-color: transparent;
      box-sizing: border-box;
    }
    
    .search-input::placeholder {
      color: #9ca3af;
    }
  `;

export const css2 = `
    .monthly-chart-container {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .monthly-chart-title {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 24px 0;
    }

    .chart-main {
      display: flex;
      gap: 12px;
    }

    .y-axis {
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      height: 300px;
      padding-right: 12px;
      border-right: 1px solid #e5e7eb;
    }

    .y-axis-label {
      font-size: 11px;
      color: #9ca3af;
      text-align: right;
    }

    .chart-content {
      flex: 1;
      position: relative;
    }

    .chart-wrapper {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 300px;
      border-bottom: 2px solid #e5e7eb;
      position: relative;
    }

    .grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 2px;
      pointer-events: none;
    }

    .grid-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #f3f4f6;
    }

    .month-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .bars-container {
      display: flex;
      gap: 4px;
      align-items: flex-end;
      height: 288px;
      margin-bottom: 8px;
      position: relative;
    }

    .bar {
      width: 20px;
      border-radius: 4px 4px 0 0;
      transition: opacity 0.2s ease;
      cursor: pointer;
      position: relative;
    }

    .bar.familias {
      background-color: #1e3a8a;
    }

    .bar.personas {
      background-color: #60a5fa;
    }

    .bar.votos {
      background-color: #1e40af;
    }

    .month-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 8px;
    }

    .hover-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      background-color: rgba(96, 165, 250, 0.1);
      pointer-events: none;
      z-index: 0;
    }

    .tooltip {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      white-space: nowrap;
      z-index: 10;
    }

    .tooltip-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .tooltip-label {
      font-weight: 500;
    }

    .tooltip-value {
      color: #111827;
      font-weight: 600;
    }

    .tooltip-row.familias .tooltip-label {
      color: #1e3a8a;
    }

    .tooltip-row.personas .tooltip-label {
      color: #60a5fa;
    }

    .tooltip-row.votos .tooltip-label {
      color: #1e40af;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }

    .legend-color.familias {
      background-color: #1e3a8a;
    }

    .legend-color.personas {
      background-color: #60a5fa;
    }

    .legend-color.votos {
      background-color: #1e40af;
    }
  `;

export const css3 = `
      .stat-card {
        background-color: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        transform: translateY(0);
      }
  
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      
      .stat-title {
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .stat-icon {
        color: #d1d5db;
        width: 24px;
        height: 24px;
      }
      
      .stat-value {
        font-size: 36px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 8px;
      }
      
      .stat-footer {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .stat-subtitle {
        font-size: 13px;
        color: #9ca3af;
      }
      
      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 500;
      }
  
      .stat-trend.positive {
        color: #10b981;
      }
  
      .stat-trend.negative {
        color: #ef4444;
      }
      
      .stat-trend-icon {
        width: 14px;
        height: 14px;
        transition: transform 0.2s ease;
      }
  
      .stat-trend-icon.positive {
        transform: none;
      }
  
      .stat-trend-icon.negative {
        transform: rotate(180deg);
      }
    `;

export const css4 = `
        .state-card {
          background-color: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          transform: translateY(0);
        }
    
        .state-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .state-name {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          margin-top: 0;
        }
        
        .state-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .state-detail {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
      `;

export const css5 = `
          .activity-container {
            background-color: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
      
          .activity-title {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 20px 0;
          }
      
          .activity-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
      
          .activity-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            transition: background-color 0.2s ease;
          }
      
          .activity-item:hover {
            background-color: #f9fafb;
          }
      
          .activity-icon {
            width: 20px;
            height: 20px;
            color: #6b7280;
            flex-shrink: 0;
            margin-top: 2px;
          }
      
          .activity-content {
            flex: 1;
          }
      
          .activity-text {
            font-size: 14px;
            color: #111827;
            margin: 0 0 4px 0;
            line-height: 1.5;
          }
      
          .activity-time {
            font-size: 12px;
            color: #9ca3af;
            margin: 0;
          }
        `;
export const css6 = `
    .delegation-card {
      background-color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      transform: translateY(0);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .delegation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .delegation-content {
      flex: 1;
    }

    .delegation-name {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .delegation-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .delegation-detail {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .delegation-arrow {
      color: #3b82f6;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
  `;

export  const css7 = `
      .back-link {
        color: #3b82f6;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 16px;
        cursor: pointer;
        transition: color 0.2s ease;
      }
  
      .back-link:hover {
        color: #2563eb;
      }
  
      .state-header {
        margin-bottom: 32px;
      }
  
      .state-title {
        font-size: 32px;
        font-weight: 700;
        color: #111827;
        margin: 0 0 8px 0;
      }
  
      .state-subtitle {
        font-size: 15px;
        color: #6b7280;
        margin: 0;
      }
  
      .delegations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 16px;
        margin-top: 32px;
      }
    `;

export const css8 = `
    .dashboard-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      background-color: #f9fafb;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }
    }
    
    .dashboard-header {
      margin-bottom: 32px;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        margin-bottom: 24px;
      }
    }
    
    .dashboard-title {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    @media (max-width: 768px) {
      .dashboard-title {
        font-size: 24px;
      }
    }
    
    .dashboard-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    @media (max-width: 768px) {
      .dashboard-subtitle {
        font-size: 14px;
      }
    }
    
    .dashboard-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 48px;
    }

    @media (max-width: 768px) {
      .dashboard-stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 32px;
      }
    }
    
    .dashboard-section-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 24px;
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-section-title {
        font-size: 20px;
        margin-bottom: 16px;
      }
    }
    
    .dashboard-states-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    @media (max-width: 768px) {
      .dashboard-states-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .dashboard-charts-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-top: 32px;
    }

    @media (max-width: 1024px) {
      .dashboard-charts-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `;