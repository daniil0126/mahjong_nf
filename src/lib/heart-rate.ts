'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

declare global {
  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    readonly value?: DataView
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  }
  interface BluetoothRemoteGATTService {
    getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>
  }
  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>
    disconnect(): void
    getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>
  }
  interface BluetoothDevice extends EventTarget {
    readonly name?: string
    readonly gatt?: BluetoothRemoteGATTServer
  }
  interface Bluetooth {
    requestDevice(options: { filters: Array<{ services: string[] }> }): Promise<BluetoothDevice>
  }
  interface Navigator {
    readonly bluetooth?: Bluetooth
  }
}

const HR_SERVICE = 'heart_rate'
const HR_MEASUREMENT_CHARACTERISTIC = 'heart_rate_measurement'
const BASELINE_SAMPLES = 30
const ELEVATION_THRESHOLD = 12
const MAX_SAMPLES = 200

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0)
  const rate16Bits = (flags & 0x1) === 1
  return rate16Bits ? value.getUint16(1, true) : value.getUint8(1)
}

export interface HeartRateState {
  supported: boolean
  connected: boolean
  connecting: boolean
  bpm: number | null
  baseline: number | null
  elevated: boolean
  error: string | null
}

function detectSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.bluetooth !== 'undefined' &&
    typeof navigator.bluetooth.requestDevice === 'function'
  )
}

const INITIAL: HeartRateState = {
  supported: false,
  connected: false,
  connecting: false,
  bpm: null,
  baseline: null,
  elevated: false,
  error: null,
}

interface Connection {
  device: BluetoothDevice
  characteristic: BluetoothRemoteGATTCharacteristic
  onMeasurement: (event: Event) => void
  onDisconnected: () => void
}

export function useHeartRate() {
  const [state, setState] = useState<HeartRateState>(() => ({
    ...INITIAL,
    supported: detectSupport(),
  }))

  const connectionRef = useRef<Connection | null>(null)
  const samplesRef = useRef<number[]>([])
  const mountedRef = useRef(true)
  const generationRef = useRef(0)

  const safeSetState = useCallback((updater: (s: HeartRateState) => HeartRateState) => {
    if (mountedRef.current) setState(updater)
  }, [])

  const tearDown = useCallback((conn: Connection | null) => {
    if (!conn) return
    try { conn.characteristic.removeEventListener('characteristicvaluechanged', conn.onMeasurement) } catch {}
    try { conn.characteristic.stopNotifications() } catch {}
    try { conn.device.removeEventListener('gattserverdisconnected', conn.onDisconnected) } catch {}
    try { conn.device.gatt?.disconnect() } catch {}
  }, [])

  const disconnect = useCallback(() => {
    generationRef.current += 1
    const conn = connectionRef.current
    connectionRef.current = null
    samplesRef.current = []
    tearDown(conn)
    safeSetState(s => ({ ...s, connected: false, connecting: false, bpm: null, baseline: null, elevated: false, error: null }))
  }, [safeSetState, tearDown])

  const connect = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      safeSetState(s => ({ ...s, error: 'Web Bluetooth не поддерживается этим браузером' }))
      return
    }

    // Tear down any existing connection before starting a new one.
    if (connectionRef.current) {
      tearDown(connectionRef.current)
      connectionRef.current = null
    }

    const myGen = ++generationRef.current
    const isStale = () => myGen !== generationRef.current || !mountedRef.current

    safeSetState(s => ({ ...s, connecting: true, error: null }))

    let device: BluetoothDevice | undefined
    let characteristic: BluetoothRemoteGATTCharacteristic | undefined

    try {
      device = await navigator.bluetooth.requestDevice({ filters: [{ services: [HR_SERVICE] }] })
      if (isStale()) { try { device.gatt?.disconnect() } catch {} ; return }

      const server = await device.gatt!.connect()
      if (isStale()) { try { server.disconnect() } catch {} ; return }

      const service = await server.getPrimaryService(HR_SERVICE)
      if (isStale()) { try { server.disconnect() } catch {} ; return }

      characteristic = await service.getCharacteristic(HR_MEASUREMENT_CHARACTERISTIC)
      if (isStale()) { try { server.disconnect() } catch {} ; return }

      await characteristic.startNotifications()
      if (isStale()) {
        try { characteristic.stopNotifications() } catch {}
        try { server.disconnect() } catch {}
        return
      }

      const onMeasurement = (event: Event) => {
        if (myGen !== generationRef.current) return
        const target = event.target as BluetoothRemoteGATTCharacteristic
        const value = target.value
        if (!value) return
        const bpm = parseHeartRate(value)
        if (!Number.isFinite(bpm) || bpm < 30 || bpm > 230) return

        samplesRef.current.push(bpm)
        if (samplesRef.current.length > MAX_SAMPLES) {
          samplesRef.current = samplesRef.current.slice(-MAX_SAMPLES)
        }

        safeSetState(s => {
          let baseline = s.baseline
          if (baseline === null && samplesRef.current.length >= BASELINE_SAMPLES) {
            const subset = samplesRef.current.slice(0, BASELINE_SAMPLES)
            baseline = Math.round(subset.reduce((a, b) => a + b, 0) / subset.length)
          }
          const elevated = baseline !== null && bpm >= baseline + ELEVATION_THRESHOLD
          return { ...s, bpm, baseline, elevated }
        })
      }

      const onDisconnected = () => {
        if (myGen !== generationRef.current) return
        connectionRef.current = null
        samplesRef.current = []
        safeSetState(s => ({ ...s, connected: false, connecting: false, bpm: null, baseline: null, elevated: false }))
      }

      characteristic.addEventListener('characteristicvaluechanged', onMeasurement)
      device.addEventListener('gattserverdisconnected', onDisconnected)

      connectionRef.current = { device, characteristic, onMeasurement, onDisconnected }
      samplesRef.current = []
      safeSetState(s => ({ ...s, connected: true, connecting: false, baseline: null, bpm: null, elevated: false }))
    } catch (err) {
      // Clean up anything partially set up if we threw mid-chain.
      try { characteristic?.stopNotifications() } catch {}
      try { device?.gatt?.disconnect() } catch {}
      const message = err instanceof Error ? err.message : 'Не удалось подключиться'
      safeSetState(s => ({ ...s, connected: false, connecting: false, error: message }))
    }
  }, [safeSetState, tearDown])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      generationRef.current += 1
      tearDown(connectionRef.current)
      connectionRef.current = null
      samplesRef.current = []
    }
  }, [tearDown])

  return { state, connect, disconnect }
}
