"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";

type ContainerStatus = "ok" | "lleno" | "saturado" | null;
type Props = {
  containerStatus: ContainerStatus;
  reportedStopIndex: number | null;
  routeChanged: boolean;
  onStopChange?: (stopIndex: number | null) => void;
  advanceToken?: number;
  rewindToken?: number;
  rewindStopIndex?: number | null;
};
type MapPoint = { x: number; y: number };

const mapSize = { width: 800, height: 900 };
const mapOrigin = { x: 220, y: 230 };
const zoomLevels = [1, 1.35, 1.7, 2.1];
const stopDwellDuration = 5_000;
const blockTravelDuration = 750;
const fallbackPoint: MapPoint = { x: 0, y: 0 };
const streetXs = [
  32, 96, 160, 224, 291, 347, 410, 473, 532, 596, 660, 724, 768,
];
const streetYs = [
  32, 96, 160, 224, 313, 380, 445, 510, 575, 640, 704, 768, 832,
];
const avenueXs = new Set([410]);
const avenueYs = new Set([510]);
const parks = new Set(["3-1", "5-0", "6-8", "9-4"]);
const streetPaths = {
  horizontal: streetYs.map((y) => `M0 ${y}H${mapSize.width}`).join(""),
  vertical: streetXs.map((x) => `M${x} 0V${mapSize.height}`).join(""),
  avenues: [
    ...[...avenueXs].map((x) => `M${x} 0V${mapSize.height}`),
    ...[...avenueYs].map((y) => `M0 ${y}H${mapSize.width}`),
  ].join(""),
};
function roadInset(value: number, avenues: Set<number>) {
  return avenues.has(value) ? 14 : 8;
}
const cityBlocks = streetYs.slice(0, -1).flatMap((top, row) =>
  streetXs.slice(0, -1).map((left, column) => {
    const right = streetXs[column + 1] ?? left;
    const bottom = streetYs[row + 1] ?? top;
    return {
      x: left + roadInset(left, avenueXs),
      y: top + roadInset(top, avenueYs),
      width:
        right - roadInset(right, avenueXs) - (left + roadInset(left, avenueXs)),
      height:
        bottom - roadInset(bottom, avenueYs) - (top + roadInset(top, avenueYs)),
      isPark: parks.has(`${row}-${column}`),
      key: `${row}-${column}`,
    };
  }),
);
const buildingMasses = cityBlocks
  .filter((block) => !block.isPark)
  .flatMap((block, index) => {
    const inset = 7 + (index % 3);
    const split = index % 4 === 0;
    if (!split) {
      return [
        {
          x: block.x + inset,
          y: block.y + inset,
          width: Math.max(8, block.width - inset * 2),
          height: Math.max(8, block.height - inset * 2),
        },
      ];
    }
    const gap = 4;
    const width = Math.max(7, (block.width - inset * 2 - gap) / 2);
    return [
      {
        x: block.x + inset,
        y: block.y + inset,
        width,
        height: block.height - inset * 2,
      },
      {
        x: block.x + inset + width + gap,
        y: block.y + inset,
        width,
        height: block.height - inset * 2,
      },
    ];
  });
const regularRoute: MapPoint[] = [
  { x: 71, y: 410 },
  { x: 71, y: 83 },
  { x: 127, y: 83 },
  { x: 127, y: 247 },
  { x: 127, y: 345 },
  { x: 220, y: 345 },
  { x: 253, y: 345 },
  { x: 253, y: 182 },
  { x: 253, y: 83 },
  { x: 347, y: 83 },
  { x: 410, y: 83 },
  { x: 410, y: 215 },
  { x: 410, y: 345 },
  { x: 473, y: 345 },
  { x: 532, y: 345 },
  { x: 532, y: 215 },
];
const regularStopIndexes = [2, 3, 5, 7, 9, 11, 13, 15];
const detourRoute: MapPoint[] = [
  { x: 71, y: 410 },
  { x: 71, y: 83 },
  { x: 127, y: 83 },
  { x: 127, y: 247 },
  { x: 127, y: 280 },
  { x: 190, y: 280 },
  { x: 190, y: 345 },
  { x: 220, y: 345 },
  { x: 253, y: 345 },
  { x: 253, y: 182 },
  { x: 253, y: 83 },
  { x: 347, y: 83 },
  { x: 410, y: 83 },
  { x: 410, y: 215 },
  { x: 410, y: 345 },
  { x: 473, y: 345 },
  { x: 532, y: 345 },
  { x: 532, y: 215 },
];
const detourStopIndexes = [2, 3, 7, 9, 11, 13, 15, 17];
const stopNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

function pointBetween(start: MapPoint, end: MapPoint, progress: number) {
  return {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
    angle: Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI),
  };
}

function travelDuration(from: MapPoint, to: MapPoint) {
  const blocks = Math.max(
    1,
    Math.round((Math.abs(to.x - from.x) + Math.abs(to.y - from.y)) / 64),
  );
  return blocks * blockTravelDuration;
}

function routePhases(route: MapPoint[], stopIndexes: number[]) {
  const phases: Array<{
    from: MapPoint;
    to: MapPoint;
    duration: number;
    stopIndex: number | null;
  }> = [];
  stopIndexes.forEach((routeIndex, stopIndex) => {
    const point = route[routeIndex] ?? route[route.length - 1] ?? fallbackPoint;
    const previousStopIndex = stopIndexes[stopIndex - 1] ?? routeIndex;
    if (stopIndex > 0) {
      for (
        let waypointIndex = previousStopIndex + 1;
        waypointIndex <= routeIndex;
        waypointIndex += 1
      ) {
        const from = route[waypointIndex - 1] ?? point;
        const to = route[waypointIndex] ?? point;
        phases.push({
          from,
          to,
          duration: travelDuration(from, to),
          stopIndex: null,
        });
      }
    }
    phases.push({
      from: point,
      to: point,
      duration: stopDwellDuration,
      stopIndex,
    });
  });
  const lastStopIndex = stopIndexes[stopIndexes.length - 1] ?? 0;
  for (
    let waypointIndex = lastStopIndex + 1;
    waypointIndex < route.length;
    waypointIndex += 1
  ) {
    const from = route[waypointIndex - 1] ?? fallbackPoint;
    const to = route[waypointIndex] ?? from;
    phases.push({
      from,
      to,
      duration: travelDuration(from, to),
      stopIndex: null,
    });
  }
  return phases;
}

function viewBoxFor(point: MapPoint, zoom: number) {
  const width = mapSize.width / zoom;
  const height = mapSize.height / zoom;
  const x = Math.max(
    0,
    Math.min(mapOrigin.x + point.x - width / 2, mapSize.width - width),
  );
  const y = Math.max(
    0,
    Math.min(mapOrigin.y + point.y - height / 2, mapSize.height - height),
  );
  return `${x} ${y} ${width} ${height}`;
}

function normalizeAngle(angle: number) {
  const normalized = angle % 360;
  if (normalized > 180) return normalized - 360;
  if (normalized < -180) return normalized + 360;
  return normalized;
}

function statusColor(status: ContainerStatus) {
  if (status === "lleno") return "#d28a25";
  if (status === "saturado") return "#c44949";
  if (status === "ok") return "#2b956f";
  return "#19765f";
}

export function BuenosAiresRouteMap({
  containerStatus,
  reportedStopIndex,
  routeChanged,
  onStopChange,
  advanceToken = 0,
  rewindToken = 0,
  rewindStopIndex = null,
}: Props) {
  const [zoomIndex, setZoomIndex] = useState(2);
  const route = routeChanged ? detourRoute : regularRoute;
  const stopIndexes = routeChanged ? detourStopIndexes : regularStopIndexes;
  const firstStopIndex = stopIndexes[0] ?? 0;
  const svgRef = useRef<SVGSVGElement>(null);
  const vehiclePositionRef = useRef<SVGGElement>(null);
  const vehicleRotationRef = useRef<SVGGElement>(null);
  const currentPointRef = useRef<MapPoint>(
    route[firstStopIndex] ?? route[0] ?? fallbackPoint,
  );
  const displayedAngleRef = useRef(-90);
  const lastWheelRef = useRef(0);
  const advanceRequestedRef = useRef(false);
  const rewindStopIndexRef = useRef<number | null>(null);
  const zoom = zoomLevels[zoomIndex] ?? 1;

  const updateViewport = useCallback(
    (point: MapPoint, nextZoom = zoom) => {
      svgRef.current?.setAttribute("viewBox", viewBoxFor(point, nextZoom));
    },
    [zoom],
  );

  const updateVehicle = useCallback(
    (point: ReturnType<typeof pointBetween>) => {
      const delta = normalizeAngle(point.angle - displayedAngleRef.current);
      displayedAngleRef.current += delta * 0.18;
      vehiclePositionRef.current?.setAttribute(
        "transform",
        `translate(${point.x} ${point.y})`,
      );
      vehicleRotationRef.current?.setAttribute(
        "transform",
        `rotate(${displayedAngleRef.current})`,
      );
    },
    [],
  );

  function adjustZoom(direction: 1 | -1) {
    setZoomIndex((current) => {
      const next = Math.max(
        0,
        Math.min(zoomLevels.length - 1, current + direction),
      );
      updateViewport(currentPointRef.current, zoomLevels[next] ?? 1);
      return next;
    });
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const now = performance.now();
    if (now - lastWheelRef.current < 160) return;
    event.preventDefault();
    lastWheelRef.current = now;
    adjustZoom(event.deltaY < 0 ? 1 : -1);
  }

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const startedAt = performance.now();
    const phases = routePhases(route, stopIndexes);
    const duration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    let timeOffset = 0;
    const resolvePhase = (elapsed: number) => {
      let remaining = elapsed;
      let phase = phases[phases.length - 1] ?? {
        from: fallbackPoint,
        to: fallbackPoint,
        duration: 1,
        stopIndex: null,
      };
      for (const candidate of phases) {
        if (remaining <= candidate.duration) {
          phase = candidate;
          break;
        }
        remaining -= candidate.duration;
      }
      return { phase, elapsed: remaining };
    };
    const elapsedAtStop = (stopIndex: number) => {
      let elapsed = 0;
      for (const phase of phases) {
        if (phase.stopIndex === stopIndex) return elapsed;
        elapsed += phase.duration;
      }
      return 0;
    };
    const animate = (now: number) => {
      if (rewindStopIndexRef.current !== null) {
        const targetElapsed = elapsedAtStop(rewindStopIndexRef.current) + 1;
        timeOffset = targetElapsed - (now - startedAt);
        advanceRequestedRef.current = false;
        rewindStopIndexRef.current = null;
      }
      let resolved = resolvePhase(
        Math.min(now - startedAt + timeOffset, duration - 1),
      );
      if (advanceRequestedRef.current && resolved.phase.stopIndex !== null) {
        timeOffset += resolved.phase.duration - resolved.elapsed;
        advanceRequestedRef.current = false;
        resolved = resolvePhase(
          Math.min(now - startedAt + timeOffset, duration - 1),
        );
      }
      const { phase, elapsed } = resolved;
      const point = pointBetween(
        phase.from,
        phase.to,
        Math.min(1, elapsed / phase.duration),
      );
      currentPointRef.current = point;
      onStopChange?.(phase.stopIndex);
      updateVehicle(point);
      if (zoom > 1) updateViewport(point);
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [onStopChange, route, stopIndexes, updateVehicle, updateViewport, zoom]);

  useEffect(() => {
    if (advanceToken > 0) advanceRequestedRef.current = true;
  }, [advanceToken]);

  useEffect(() => {
    if (rewindToken > 0 && rewindStopIndex !== null) {
      rewindStopIndexRef.current = rewindStopIndex;
    }
  }, [rewindStopIndex, rewindToken]);

  useEffect(() => {
    const point = pointBetween(
      route[firstStopIndex - 1] ?? route[0] ?? fallbackPoint,
      route[firstStopIndex] ?? route[0] ?? fallbackPoint,
      1,
    );
    currentPointRef.current = point;
    onStopChange?.(0);
    updateVehicle(point);
    updateViewport(point);
  }, [
    firstStopIndex,
    onStopChange,
    route,
    routeChanged,
    updateVehicle,
    updateViewport,
    zoomIndex,
  ]);

  const routePath = routeChanged
    ? "M127 83V280H190V345H220H253V83H347H410V345H473H532V215"
    : "M127 83V345H220H253V83H347H410V345H473H532V215";
  const startingPoint = pointBetween(
    route[firstStopIndex - 1] ?? route[0] ?? fallbackPoint,
    route[firstStopIndex] ?? route[0] ?? fallbackPoint,
    1,
  );
  const routeStops = stopIndexes.map(
    (routeIndex) =>
      route[routeIndex] ?? route[route.length - 1] ?? fallbackPoint,
  );
  const routeEnd = route[route.length - 1] ?? fallbackPoint;

  return (
    <div
      className="simulated-map"
      onWheel={handleWheel}
      aria-describedby="simulated-map-description"
    >
      <p id="simulated-map-description" className="visually-hidden">
        Mapa operativo simulado de Centro y Monserrat. Muestra la ruta, los
        puntos de recolección y la posición del camión.
      </p>
      <svg
        ref={svgRef}
        viewBox={viewBoxFor(startingPoint, zoom)}
        aria-hidden="true"
        shapeRendering="geometricPrecision"
      >
        <rect
          className="sim-map-land"
          width={mapSize.width}
          height={mapSize.height}
        />
        <g className="sim-map-blocks">
          {cityBlocks.map((block) => (
            <rect
              key={block.key}
              className={block.isPark ? "sim-map-park" : "sim-map-block"}
              x={block.x}
              y={block.y}
              width={block.width}
              height={block.height}
            />
          ))}
        </g>
        <g className="sim-map-buildings">
          {buildingMasses.map((building, index) => (
            <rect key={index} {...building} rx="2" />
          ))}
        </g>
        <g className="sim-map-road-edges" shapeRendering="crispEdges">
          <path d={streetPaths.horizontal} />
          <path d={streetPaths.vertical} />
        </g>
        <g className="sim-map-roads" shapeRendering="crispEdges">
          <path d={streetPaths.horizontal} />
          <path d={streetPaths.vertical} />
        </g>
        <path className="sim-map-avenue-edge" d={streetPaths.avenues} />
        <path className="sim-map-avenue" d={streetPaths.avenues} />
        <path className="sim-map-avenue-center" d={streetPaths.avenues} />
        <g transform={`translate(${mapOrigin.x} ${mapOrigin.y})`}>
          <g className="sim-map-labels">
            <text x="78" y="72">
              Defensa
            </text>
            <text x="196" y="139">
              Perú
            </text>
            <text x="82" y="205">
              Bolívar
            </text>
            <text x="194" y="269">
              Moreno
            </text>
            <text x="87" y="335">
              Chacabuco
            </text>
            <text
              className="sim-map-avenue-label"
              x="185"
              y="358"
              transform="rotate(-90 185 358)"
            >
              Av. Belgrano
            </text>
            <text className="sim-map-park-label" x="24" y="187">
              Plaza
            </text>
          </g>
          <path className="sim-map-completed-casing" d="M71 410V83h56" />
          <path className="sim-map-completed" d="M71 410V83h56" />
          <path className="sim-map-route-casing" d={routePath} />
          <path className="sim-map-route" d={routePath} />
          <g className="sim-map-route-markers">
            <circle cx="71" cy="410" r="8" className="sim-map-route-start" />
            <circle
              cx={routeEnd.x}
              cy={routeEnd.y}
              r="8"
              className="sim-map-route-end"
            />
          </g>
          {routeStops.map((point, index) => (
            <g key={`${point.x}-${point.y}`}>
              <circle
                className="sim-map-stop-halo"
                cx={point.x}
                cy={point.y}
                r="12"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill={
                  index === reportedStopIndex
                    ? statusColor(containerStatus)
                    : "#19765f"
                }
              />
              <text className="sim-map-stop-number" x={point.x} y={point.y + 3}>
                {stopNumbers[index]}
              </text>
            </g>
          ))}
          <g
            ref={vehiclePositionRef}
            className="sim-map-vehicle"
            transform={`translate(${startingPoint.x} ${startingPoint.y})`}
          >
            <g
              ref={vehicleRotationRef}
              transform={`rotate(${startingPoint.angle})`}
            >
              <circle className="sim-map-vehicle-halo" r="18" />
              <circle className="sim-map-vehicle-core" r="13" />
              <path d="M-7-5h11v9H-7zM4-2h5l3 3v3H4zM-4 6a2 2 0 1 0 0 .1M8 6a2 2 0 1 0 0 .1" />
            </g>
          </g>
        </g>
      </svg>
      <div className="map-simulation-badge" aria-hidden="true">
        <span /> Señal simulada
      </div>
      <div
        className="map-zoom-controls"
        role="group"
        aria-label="Controles de zoom del mapa"
      >
        <button
          type="button"
          onClick={() => adjustZoom(1)}
          disabled={zoomIndex === zoomLevels.length - 1}
          aria-label="Acercar mapa"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(-1)}
          disabled={zoomIndex === 0}
          aria-label="Alejar mapa"
        >
          −
        </button>
      </div>
    </div>
  );
}
