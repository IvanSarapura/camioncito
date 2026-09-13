"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BuenosAiresRouteMap } from "./buenos-aires-route-map";

type ContainerStatus = "ok" | "lleno" | "saturado";
const suggestionDuration = 10_000;

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
const stopSequence = [1, 2, 3, 4, 5, 6, 7, 8];

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
  const [undoVisible, setUndoVisible] = useState(false);
  const [reportedStopIndex, setReportedStopIndex] = useState<number | null>(
    null,
  );
  const [routeChangeVisible, setRouteChangeVisible] = useState(false);
  const [routeChanged, setRouteChanged] = useState(false);
  const [suggestionAvailable, setSuggestionAvailable] = useState(true);
  const [advanceToken, setAdvanceToken] = useState(0);
  const [rewindToken, setRewindToken] = useState(0);
  const [rewindStopIndex, setRewindStopIndex] = useState<number | null>(null);
  const [activeStop, setActiveStop] = useState<number | null>(0);
  const activeStopRef = useRef<number | null>(0);
  const selectedStatus = statusOptions.find((option) => option.id === status);

  function reportStatus(nextStatus: ContainerStatus) {
    if (activeStop === null) return;
    setStatus(nextStatus);
    setReportedStopIndex(activeStop);
    setAdvanceToken((token) => token + 1);
    setUndoVisible(true);
  }

  const handleStopChange = useCallback((stopIndex: number | null) => {
    if (activeStopRef.current === stopIndex) return;
    activeStopRef.current = stopIndex;
    setActiveStop(stopIndex);
    if (stopIndex !== null) {
      setStatus(null);
      setReportedStopIndex(null);
      setUndoVisible(false);
    }
  }, []);

  function undoReport() {
    const stopToRestore = reportedStopIndex;
    setStatus(null);
    setReportedStopIndex(null);
    setUndoVisible(false);
    if (stopToRestore !== null) {
      activeStopRef.current = stopToRestore;
      setActiveStop(stopToRestore);
      setRewindStopIndex(stopToRestore);
      setRewindToken((token) => token + 1);
    }
  }

  useEffect(() => {
    if (routeChanged || !suggestionAvailable) return;
    const timeout = window.setTimeout(() => {
      setRouteChangeVisible(false);
      setSuggestionAvailable(false);
    }, suggestionDuration);
    return () => window.clearTimeout(timeout);
  }, [routeChanged, suggestionAvailable]);

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
          <span>Rumbo</span>
        </div>
        <div className="route-chip">
          <span className="live-dot" aria-hidden="true" /> Recorrido activo
        </div>
      </header>

      <main id="route-content" className="route-main" tabIndex={-1}>
        <h1 className="visually-hidden">Recorrido de recolección</h1>

        <section className="next-stop" aria-label="Próxima parada">
          <div className="next-stop-main">
            <span className="direction-icon" aria-hidden="true">
              <Icon name="arrow" size={24} />
            </span>
            <div>
              <strong>Próxima parada</strong>
              <p>120 m · Calle Moreno 840</p>
            </div>
            <span className="eta">1 min</span>
          </div>
          {!routeChanged && suggestionAvailable ? (
            <div className="route-suggestion">
              <button
                className="suggestion-trigger"
                type="button"
                onClick={() => setRouteChangeVisible((visible) => !visible)}
                aria-expanded={routeChangeVisible}
                aria-controls="route-change-details"
              >
                <span className="suggestion-icon" aria-hidden="true">
                  <Icon name="spark" size={18} />
                </span>
                <span className="suggestion-copy">
                  <strong>Sugerencia de ruta</strong>
                  <small>Evitá Av. Sarmiento</small>
                </span>
                <span className="suggestion-control">
                  {routeChangeVisible ? "Ocultar" : "Ver"}
                </span>
              </button>
              <div
                id="route-change-details"
                className="route-change"
                hidden={!routeChangeVisible}
              >
                <p>Obra vial a 300 m. El desvío suma 2 min.</p>
                <button type="button" onClick={() => setRouteChanged(true)}>
                  <Icon name="route" size={18} /> Aplicar desvío
                </button>
              </div>
            </div>
          ) : routeChanged ? (
            <div className="route-applied" role="status">
              <Icon name="check" size={19} />
              <span>Desvío aplicado. Seguí las indicaciones del mapa.</span>
            </div>
          ) : null}
        </section>

        <section className="map-card" aria-labelledby="map-title">
          <h2 id="map-title" className="visually-hidden">
            Mapa del recorrido actual
          </h2>
          <BuenosAiresRouteMap
            containerStatus={status}
            reportedStopIndex={reportedStopIndex}
            routeChanged={routeChanged}
            onStopChange={handleStopChange}
            advanceToken={advanceToken}
            rewindToken={rewindToken}
            rewindStopIndex={rewindStopIndex}
          />
          <p className="map-caption">
            Montserrat · Ruta y puntos de recolección
          </p>
        </section>

        <section
          className="container-status"
          aria-labelledby="container-status-title"
        >
          <div className="status-heading">
            <div>
              <p className="status-stop">
                {activeStop === null
                  ? "Próxima parada"
                  : `Punto ${stopSequence[activeStop]} de 8`}
              </p>
              <h2 id="container-status-title">
                {activeStop === null
                  ? "En camino al próximo punto"
                  : "¿Cómo está el contenedor?"}
              </h2>
            </div>
            <span
              className={`status-state ${activeStop === null ? "moving" : "ready"}`}
            >
              <span aria-hidden="true" />
              {activeStop === null ? "En camino" : "5 s para informar"}
            </span>
          </div>
          <p className="status-location">
            {activeStop === null
              ? "El estado se habilita al llegar."
              : "Calle Moreno 840"}
          </p>
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
                disabled={activeStop === null}
              >
                <Icon name={option.icon} size={23} />
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>
        </section>
      </main>

      {selectedStatus && undoVisible && (
        <div
          className={`report-toast ${selectedStatus.id}`}
          role="status"
          aria-live="polite"
        >
          <Icon name={selectedStatus.icon} size={20} />
          <span>
            <strong>Estado reportado: {selectedStatus.label}</strong>
            <small>Podés corregirlo hasta llegar a la próxima parada.</small>
          </span>
          <button
            className="undo-button"
            type="button"
            onClick={undoReport}
            aria-label={`Deshacer reporte de contenedor ${selectedStatus.label.toLowerCase()}`}
          >
            <svg
              className="undo-timer"
              viewBox="0 0 100 44"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect
                className="undo-timer-path"
                x="1"
                y="1"
                width="98"
                height="42"
                rx="9"
                pathLength="100"
              />
            </svg>
            <span>Deshacer</span>
          </button>
          <button
            type="button"
            onClick={() => setUndoVisible(false)}
            aria-label="Cerrar confirmación"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
