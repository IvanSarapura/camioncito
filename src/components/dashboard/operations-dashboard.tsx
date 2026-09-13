"use client";

import { useState } from "react";
import { BuenosAiresRouteMap } from "./buenos-aires-route-map";

type ContainerStatus = "ok" | "lleno" | "saturado";

const statusOptions: Array<{
  id: ContainerStatus;
  label: string;
  icon: "check" | "full" | "alert";
}> = [
  { id: "ok", label: "OK", icon: "check" },
  {
    id: "lleno",
    label: "Lleno",
    icon: "full",
  },
  {
    id: "saturado",
    label: "Saturado",
    icon: "alert",
  },
];

function Icon({
  name,
  size = 20,
}: {
  name:
    | "truck"
    | "route"
    | "check"
    | "full"
    | "alert"
    | "locate"
    | "spark"
    | "arrow"
    | "close";
  size?: number;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths = {
    truck: (
      <>
        <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 17c5-1 3-8 8-9" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    full: (
      <>
        <path d="M5 8h14l-1 12H6z" />
        <path d="M4 8h16M9 4h6M10 12h4" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    locate: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    spark: (
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg {...props}>{paths[name]}</svg>;
}

export function OperationsDashboard() {
  const [status, setStatus] = useState<ContainerStatus | null>(null);
  const [routeChangeVisible, setRouteChangeVisible] = useState(false);
  const [routeChanged, setRouteChanged] = useState(false);
  const [recenterToken, setRecenterToken] = useState(0);
  const selectedStatus = statusOptions.find((option) => option.id === status);

  function reportStatus(nextStatus: ContainerStatus) {
    setStatus(nextStatus);
  }

  return (
    <div className="driver-app">
      <a className="skip-link" href="#route-content">
        Ir al recorrido
      </a>
      <header className="driver-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="truck" size={22} />
          </span>
          <span>camioncito</span>
        </div>
        <div className="route-chip">
          <span className="live-dot" aria-hidden="true" /> Recorrido activo
        </div>
      </header>

      <main id="route-content" className="route-main" tabIndex={-1}>
        <section className="route-summary" aria-labelledby="route-title">
          <div>
            <p>Tu recorrido</p>
            <h1 id="route-title">Ruta Centro 02</h1>
          </div>
          <button
            className="locate-button"
            type="button"
            aria-label="Centrar ubicación actual"
            onClick={() => setRecenterToken((token) => token + 1)}
          >
            <Icon name="locate" />
          </button>
        </section>

        <section className="next-stop" aria-label="Próxima parada">
          <span className="direction-icon" aria-hidden="true">
            <Icon name="arrow" size={24} />
          </span>
          <div>
            <strong>Próxima parada</strong>
            <p>120 m · Calle Moreno 840</p>
          </div>
          <span className="eta">1 min</span>
        </section>

        <section className="map-card" aria-labelledby="map-title">
          <h2 id="map-title" className="visually-hidden">
            Mapa del recorrido actual
          </h2>
          <BuenosAiresRouteMap
            containerStatus={status}
            routeChanged={routeChanged}
            recenterToken={recenterToken}
          />
          <p className="map-caption">
            Simulación operativa · Centro / Monserrat · Ruta y puntos de
            recolección
          </p>
        </section>

        {!routeChanged && (
          <section
            className="route-suggestion"
            aria-labelledby="suggestion-title"
          >
            <span className="suggestion-icon" aria-hidden="true">
              <Icon name="spark" />
            </span>
            <div>
              <p>Hay un cambio recomendado</p>
              <h2 id="suggestion-title">Evitá Av. Sarmiento</h2>
              <span>Obra vial a 300 m de tu recorrido.</span>
            </div>
            <button
              className="suggestion-action"
              type="button"
              onClick={() => setRouteChangeVisible((visible) => !visible)}
              aria-expanded={routeChangeVisible}
            >
              {routeChangeVisible ? "Ocultar" : "Ver cambio"}
            </button>
            {routeChangeVisible && (
              <div className="route-change">
                <p>El desvío suma 2 min y mantiene las próximas 6 paradas.</p>
                <button type="button" onClick={() => setRouteChanged(true)}>
                  <Icon name="route" size={18} /> Aplicar desvío
                </button>
              </div>
            )}
          </section>
        )}

        {routeChanged && (
          <section className="route-applied" role="status">
            <Icon name="check" size={19} />
            <span>Desvío aplicado. Seguí las indicaciones del mapa.</span>
          </section>
        )}

        <section
          className="container-status"
          aria-labelledby="container-status-title"
        >
          <div className="status-heading">
            <div>
              <p>Estás en Calle Moreno 840</p>
              <h2 id="container-status-title">¿Cómo está el contenedor?</h2>
            </div>
            <span>Detené el vehículo antes de reportar</span>
          </div>
          <div
            className="status-actions"
            role="group"
            aria-label="Estado del contenedor"
          >
            {statusOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`status-button ${option.id}${status === option.id ? " selected" : ""}`}
                onClick={() => reportStatus(option.id)}
                aria-pressed={status === option.id}
              >
                <Icon name={option.icon} size={23} />
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>
        </section>
      </main>

      {selectedStatus && (
        <div
          className={`report-toast ${selectedStatus.id}`}
          role="status"
          aria-live="polite"
        >
          <Icon name={selectedStatus.icon} size={20} />
          <span>
            <strong>Estado reportado: {selectedStatus.label}</strong>
          </span>
          <button type="button" onClick={() => setStatus(null)}>
            Deshacer
          </button>
          <button
            type="button"
            onClick={() => setStatus(null)}
            aria-label="Cerrar confirmación"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
