"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  Headphones,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AudioTrack = {
  id: number
  url: string
  title: string
  subtitle: string
}

type AudioPlayerContextValue = {
  track: AudioTrack | null
  currentTime: number
  duration: number
  isPlaying: boolean
  playTrack: (track: AudioTrack, startTime?: number) => void
  togglePlayback: () => void
  seekTo: (time: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "00:00"
  const totalSeconds = Math.floor(value)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) throw new Error("音频播放器必须在 AudioPlayerProvider 内使用。")
  return context
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [track, setTrack] = useState<AudioTrack | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [error, setError] = useState("")

  const safelyPlay = useCallback(async (audio: HTMLAudioElement) => {
    try {
      await audio.play()
      setError("")
    } catch {
      setIsPlaying(false)
      setError("当前录音无法播放，请检查录音地址。")
    }
  }, [])

  const playTrack = useCallback(
    (nextTrack: AudioTrack, startTime = 0) => {
      const audio = audioRef.current
      if (!audio) return

      const safeStartTime = Math.max(0, startTime)
      const isCurrentTrack = track?.id === nextTrack.id && audio.src.length > 0
      setTrack(nextTrack)
      setCurrentTime(safeStartTime)
      setError("")

      if (isCurrentTrack) {
        audio.currentTime = safeStartTime
        void safelyPlay(audio)
        return
      }

      audio.src = nextTrack.url
      audio.load()
      const startPlayback = () => {
        audio.currentTime = safeStartTime
        void safelyPlay(audio)
      }

      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        startPlayback()
      } else {
        audio.addEventListener("loadedmetadata", startPlayback, { once: true })
      }
    },
    [safelyPlay, track?.id]
  )

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    if (audio.paused) void safelyPlay(audio)
    else audio.pause()
  }, [safelyPlay, track])

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    const nextTime = Math.max(0, Math.min(time, audio.duration || time))
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }, [])

  const jumpBy = useCallback(
    (seconds: number) => seekTo(currentTime + seconds),
    [currentTime, seekTo]
  )

  const changePlaybackRate = useCallback(() => {
    const rates = [1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    setPlaybackRate(nextRate)
    if (audioRef.current) audioRef.current.playbackRate = nextRate
  }, [playbackRate])

  const contextValue = useMemo<AudioPlayerContextValue>(
    () => ({
      track,
      currentTime,
      duration,
      isPlaying,
      playTrack,
      togglePlayback,
      seekTo,
    }),
    [track, currentTime, duration, isPlaying, playTrack, togglePlayback, seekTo]
  )

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onDurationChange={(event) =>
          setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)
        }
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false)
          setError("当前录音无法播放，请检查录音地址。")
        }}
      />

      <section
        className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-[#161617]/96 text-white shadow-[0_-12px_35px_rgba(0,0,0,0.2)] backdrop-blur-2xl lg:left-64"
        aria-label="全局录音播放器"
      >
        <div className="mx-auto flex min-h-24 max-w-7xl flex-col gap-3 px-4 py-3 sm:min-h-20 sm:flex-row sm:items-center sm:gap-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:w-52 lg:w-64">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0071e3] shadow-[0_5px_18px_rgba(0,113,227,0.3)]">
              <Headphones className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {track?.title ?? "全局录音播放器"}
              </span>
              <span className={cn("block truncate text-xs", error ? "text-[#ff6961]" : "text-[#a1a1a6]")}>
                {error || track?.subtitle || "从交互记录中选择一段录音"}
              </span>
            </span>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-[#d2d2d7] hover:bg-white/10 hover:text-white"
              onClick={() => jumpBy(-10)}
              disabled={!track}
              aria-label="后退十秒"
            >
              <RotateCcw aria-hidden="true" />
            </Button>
            <Button
              size="icon"
              className="size-10 shrink-0 rounded-full bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
              onClick={togglePlayback}
              disabled={!track}
              aria-label={isPlaying ? "暂停录音" : "播放录音"}
            >
              {isPlaying ? <Pause aria-hidden="true" /> : <Play className="ml-0.5" aria-hidden="true" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-[#d2d2d7] hover:bg-white/10 hover:text-white"
              onClick={() => jumpBy(10)}
              disabled={!track}
              aria-label="前进十秒"
            >
              <RotateCw aria-hidden="true" />
            </Button>

            <span className="w-11 shrink-0 text-right font-mono text-[0.68rem] text-[#a1a1a6]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seekTo(Number(event.target.value))}
              disabled={!track || !duration}
              className="h-1 min-w-16 flex-1 cursor-pointer accent-[#0a84ff] disabled:cursor-default disabled:opacity-35"
              aria-label="录音播放进度"
            />
            <span className="w-11 shrink-0 font-mono text-[0.68rem] text-[#a1a1a6]">
              {formatTime(duration)}
            </span>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              className="h-8 min-w-12 px-2 font-mono text-xs text-[#d2d2d7] hover:bg-white/10 hover:text-white"
              onClick={changePlaybackRate}
              disabled={!track}
              aria-label={`当前播放速度 ${playbackRate} 倍，点击切换`}
            >
              {playbackRate}×
            </Button>
            <Volume2 className="size-4 text-[#a1a1a6]" aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => {
                const nextVolume = Number(event.target.value)
                setVolume(nextVolume)
                if (audioRef.current) audioRef.current.volume = nextVolume
              }}
              className="h-1 w-20 cursor-pointer accent-white"
              aria-label="录音音量"
            />
          </div>
        </div>
      </section>
    </AudioPlayerContext.Provider>
  )
}
