'use client';

import { useState, useEffect } from 'react';

/**
 * ============================================
 * COMPONENTE: LOCATION GUARD
 * Verifica que el usuario tenga ubicación activa
 * Bloquea acceso si no está activada
 * ============================================
 */

const LocationGuard = ({ children }) => {
  const [locationGranted, setLocationGranted] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  /**
   * Verificar permisos de ubicación
   */
  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setLocationGranted(false);
      setChecking(false);
      return;
    }

    try {
      // Primero verificar si ya tenemos permisos
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

        if (permissionStatus.state === 'denied') {
          setError('Debes habilitar los permisos de ubicación para usar esta aplicación');
          setLocationGranted(false);
          setChecking(false);
          return;
        }
      }

      // Solicitar ubicación
      requestLocation();
    } catch (error) {
      console.error('Error checking permission:', error);
      requestLocation();
    }
  };

  /**
   * Solicitar ubicación actual
   */
  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        setLocation(locationData);
        setLocationGranted(true);
        setChecking(false);

        // Guardar en sessionStorage para futuras peticiones
        sessionStorage.setItem('userLocation', JSON.stringify(locationData));

        console.log('✅ Ubicación obtenida:', locationData);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);

        let errorMessage = 'No se pudo obtener tu ubicación';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Debes permitir el acceso a tu ubicación para usar esta aplicación';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Tu ubicación no está disponible en este momento';
            break;
          case error.TIMEOUT:
            errorMessage = 'Se agotó el tiempo esperando tu ubicación';
            break;
          default:
            errorMessage = 'Error desconocido al obtener ubicación';
        }

        setError(errorMessage);
        setLocationGranted(false);
        setChecking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Reintentar obtener ubicación
   */
  const handleRetry = () => {
    setChecking(true);
    setError(null);
    setTimeout(() => {
      checkLocationPermission();
    }, 500);
  };

  /**
   * Pantalla de carga
   */
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificando Ubicación
          </h2>

          <p className="text-gray-600 mb-6">
            Por favor, permite el acceso a tu ubicación para continuar
          </p>

          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Pantalla de error / permisos denegados
   */
  if (!locationGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso Bloqueado
            </h2>

            <p className="text-red-600 font-medium mb-4">
              {error}
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Razones de seguridad:
                </h3>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>Prevención de accesos no autorizados</li>
                  <li>Detección de actividad sospechosa</li>
                  <li>Registro de auditoría completo</li>
                  <li>Cumplimiento de políticas de seguridad</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reintentar
            </button>

            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                ¿Cómo habilitar la ubicación?
              </summary>
              <div className="mt-3 pl-4 space-y-2">
                <p className="font-medium">Chrome:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click en el ícono de candado en la barra de direcciones</li>
                  <li>Selecciona "Configuración del sitio"</li>
                  <li>Cambia "Ubicación" a "Permitir"</li>
                  <li>Recarga la página</li>
                </ol>

                <p className="font-medium mt-3">Firefox:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click en el ícono de información en la barra de direcciones</li>
                  <li>Click en "Más información"</li>
                  <li>Ve a la pestaña "Permisos"</li>
                  <li>Desmarca "Usar predeterminado" en "Acceder a su ubicación"</li>
                  <li>Marca "Permitir"</li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Si todo está OK, renderizar children
   */
  return <>{children}</>;
};

export default LocationGuard;
