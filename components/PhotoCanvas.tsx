'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageState {
  x: number
  y: number
  scale: number
}

export default function PhotoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageState, setImageState] = useState<ImageState>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasSize = 512

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Draw border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvasSize, canvasSize)

    // Draw image
    if (image) {
      ctx.save()
      ctx.translate(imageState.x, imageState.y)
      ctx.scale(imageState.scale, imageState.scale)
      ctx.drawImage(image, 0, 0)
      ctx.restore()
    }
  }, [image, imageState])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        // Center and fit the image
        const scale = Math.min(canvasSize / img.width, canvasSize / img.height)
        const x = (canvasSize - img.width * scale) / 2
        const y = (canvasSize - img.height * scale) / 2
        setImageState({ x, y, scale })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!image) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - imageState.x, y: e.clientY - imageState.y })
  }

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (!image) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - imageState.x, y: touch.clientY - imageState.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return
    setImageState({
      ...imageState,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !image) return
    const touch = e.touches[0]
    setImageState({
      ...imageState,
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.1 : 0.9
    setImageState({
      ...imageState,
      scale: Math.max(0.5, Math.min(3, imageState.scale * zoomFactor)),
    })
  }

  const handleFitSquare = () => {
    if (!image) return
    const scale = Math.min(canvasSize / image.width, canvasSize / image.height)
    const x = (canvasSize - image.width * scale) / 2
    const y = (canvasSize - image.height * scale) / 2
    setImageState({ x, y, scale })
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = 'minecraft-photo.png'
    link.click()
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-center">Minecraft Photo Thing</h1>
        <p className="text-center text-gray-600">Choose a photo and position it on the canvas</p>
      </div>

      {/* Photo Input */}
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          Choose Photo
        </button>
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="border-4 border-gray-300 rounded-lg cursor-move touch-none bg-white"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Controls */}
      {image && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => handleZoom('in')}
            className="bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-3 rounded transition"
          >
            Zoom In +
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-3 rounded transition"
          >
            Zoom Out -
          </button>
          <button
            onClick={handleFitSquare}
            className="bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-3 rounded transition"
          >
            Fit Square
          </button>
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded transition col-span-2 sm:col-span-1"
          >
            Save
          </button>
        </div>
      )}

      {/* Instructions */}
      {image && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p><strong>Drag</strong> the image to reposition it</p>
          <p><strong>Use buttons</strong> to zoom and fit the image</p>
        </div>
      )}
    </div>
  )
}
