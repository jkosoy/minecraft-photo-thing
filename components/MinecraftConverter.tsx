'use client'

import { useState, useRef, useEffect } from 'react'

type Size = 'small' | 'medium' | 'large'
type Palette = 'concrete' | 'terracotta' | 'wool' | 'dyed'

interface SizeConfig {
  display: string
  pixels: number
}

interface BlockColor {
  name: string
  hex: string
  mcColor: string
}

interface PaletteOption {
  label: string
  colors: BlockColor[]
}

const SIZES: Record<Size, SizeConfig> = {
  small: { display: 'Small (32x32)', pixels: 32 },
  medium: { display: 'Medium (64x64)', pixels: 64 },
  large: { display: 'Large (128x128)', pixels: 128 },
}

const PALETTES: Record<Palette, PaletteOption> = {
  concrete: {
    label: 'Concrete (Bright)',
    colors: [
      { name: 'White', hex: '#E8E8E8', mcColor: '#fff' },
      { name: 'Light Gray', hex: '#CECECE', mcColor: '#aaa' },
      { name: 'Gray', hex: '#898989', mcColor: '#666' },
      { name: 'Black', hex: '#383838', mcColor: '#000' },
      { name: 'Red', hex: '#D42426', mcColor: '#c00' },
      { name: 'Orange', hex: '#EB8844', mcColor: '#fa0' },
      { name: 'Yellow', hex: '#FFED4E', mcColor: '#ff0' },
      { name: 'Lime', hex: '#39D635', mcColor: '#0f0' },
      { name: 'Cyan', hex: '#16A7EA', mcColor: '#0ff' },
      { name: 'Blue', hex: '#3C44AA', mcColor: '#00f' },
      { name: 'Purple', hex: '#B039DC', mcColor: '#f0f' },
      { name: 'Magenta', hex: '#E358A0', mcColor: '#f0f' },
    ],
  },
  terracotta: {
    label: 'Terracotta (Muted)',
    colors: [
      { name: 'White', hex: '#D7D7D7', mcColor: '#ddd' },
      { name: 'Light Gray', hex: '#ABABAB', mcColor: '#aaa' },
      { name: 'Gray', hex: '#717171', mcColor: '#666' },
      { name: 'Black', hex: '#2B2B2B', mcColor: '#1a1a1a' },
      { name: 'Red', hex: '#A43B27', mcColor: '#a33' },
      { name: 'Orange', hex: '#B87333', mcColor: '#a65' },
      { name: 'Yellow', hex: '#C19C3F', mcColor: '#bb8' },
      { name: 'Lime', hex: '#7BA331', mcColor: '#7a3' },
      { name: 'Cyan', hex: '#4D7EA3', mcColor: '#579' },
      { name: 'Blue', hex: '#435F9F', mcColor: '#459' },
      { name: 'Purple', hex: '#8E4B81', mcColor: '#859' },
      { name: 'Magenta', hex: '#A04B5D', mcColor: '#a59' },
    ],
  },
  wool: {
    label: 'Wool (Classic)',
    colors: [
      { name: 'White', hex: '#F0F0F0', mcColor: '#fff' },
      { name: 'Light Gray', hex: '#BFBFBF', mcColor: '#bbb' },
      { name: 'Gray', hex: '#808080', mcColor: '#888' },
      { name: 'Black', hex: '#1E1E1E', mcColor: '#111' },
      { name: 'Red', hex: '#C13B3B', mcColor: '#c33' },
      { name: 'Orange', hex: '#D87F33', mcColor: '#d93' },
      { name: 'Yellow', hex: '#E5E533', mcColor: '#ee3' },
      { name: 'Lime', hex: '#7FCC19', mcColor: '#7f0' },
      { name: 'Cyan', hex: '#4FD0E7', mcColor: '#0ff' },
      { name: 'Blue', hex: '#3366CC', mcColor: '#33f' },
      { name: 'Purple', hex: '#B266E5', mcColor: '#b0f' },
      { name: 'Magenta', hex: '#D92D92', mcColor: '#d0f' },
    ],
  },
  dyed: {
    label: 'Dyed Wool (Extended)',
    colors: [
      { name: 'White', hex: '#F0F0F0', mcColor: '#fff' },
      { name: 'Light Gray', hex: '#BFBFBF', mcColor: '#bbb' },
      { name: 'Gray', hex: '#808080', mcColor: '#888' },
      { name: 'Black', hex: '#1E1E1E', mcColor: '#111' },
      { name: 'Red', hex: '#CC0000', mcColor: '#f00' },
      { name: 'Orange', hex: '#FF8800', mcColor: '#f80' },
      { name: 'Yellow', hex: '#FFFF00', mcColor: '#ff0' },
      { name: 'Lime', hex: '#00FF00', mcColor: '#0f0' },
      { name: 'Light Blue', hex: '#5599FF', mcColor: '#5af' },
      { name: 'Cyan', hex: '#00FFFF', mcColor: '#0ff' },
      { name: 'Blue', hex: '#0000FF', mcColor: '#00f' },
      { name: 'Purple', hex: '#FF00FF', mcColor: '#f0f' },
      { name: 'Pink', hex: '#FF88EE', mcColor: '#fae' },
      { name: 'Brown', hex: '#8B4513', mcColor: '#843' },
    ],
  },
}

function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hex1.match(/\w\w/g)!.map(x => parseInt(x, 16))
  const [r2, g2, b2] = hex2.match(/\w\w/g)!.map(x => parseInt(x, 16))
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function nearestColor(hex: string, palette: BlockColor[]): BlockColor {
  return palette.reduce((nearest, color) => 
    colorDistance(hex, color.hex) < colorDistance(hex, nearest.hex) ? color : nearest
  )
}

export default function MinecraftConverter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageState, setImageState] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState<Size>('medium')
  const [palette, setPalette] = useState<Palette>('concrete')
  const [blockData, setBlockData] = useState<BlockColor[][]>([])
  const [packName, setPackName] = useState('minecraft-photo')
  const canvasSize = 512

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvasSize, canvasSize)

    if (image) {
      ctx.save()
      ctx.translate(imageState.x, imageState.y)
      ctx.scale(imageState.scale, imageState.scale)
      ctx.drawImage(image, 0, 0)
      ctx.restore()
    }
  }, [image, imageState])

  // Draw preview
  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (!canvas || blockData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pixelSize = canvasSize / blockData.length
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    blockData.forEach((row, y) => {
      row.forEach((color, x) => {
        ctx.fillStyle = color.hex
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        
        // Grid lines
        ctx.strokeStyle = '#cccccc'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      })
    })
  }, [blockData])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
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

  const handleConvert = (currentSize: Size, currentPalette: Palette) => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pixelSize = SIZES[currentSize].pixels
    const blocks: BlockColor[][] = []
    const paletteColors = PALETTES[currentPalette].colors

    for (let y = 0; y < pixelSize; y++) {
      const row: BlockColor[] = []
      for (let x = 0; x < pixelSize; x++) {
        const imgX = Math.round((x / pixelSize) * canvasSize)
        const imgY = Math.round((y / pixelSize) * canvasSize)
        
        const imageData = ctx.getImageData(imgX, imgY, 1, 1)
        const [r, g, b] = imageData.data
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
        
        const nearestBlock = nearestColor(hex, paletteColors)
        row.push(nearestBlock)
      }
      blocks.push(row)
    }

    setBlockData(blocks)
  }

  // Auto-convert when image, size, or palette changes
  useEffect(() => {
    if (image) {
      // Small delay to ensure canvas is rendered with the image
      const timer = setTimeout(() => {
        handleConvert(size, palette)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [size, palette, image])

  const handleSave = async () => {
    if (blockData.length === 0) return

    // Dynamic import JSZip
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Create manifest.json
    const manifest = {
      format_version: 2,
      header: {
        description: `Minecraft photo art pack: ${packName}`,
        name: packName,
        uuid: generateUUID(),
        version: [1, 0, 0],
        min_engine_version: [1, 19, 0],
      },
      modules: [
        {
          description: 'Structure templates',
          type: 'data',
          uuid: generateUUID(),
          version: [1, 0, 0],
        },
      ],
    }

    zip.file('manifest.json', JSON.stringify(manifest, null, 2))

    // Create structure file
    const structureData = createStructureFile(blockData, PALETTES[palette].colors)
    zip.folder('structures')!.file(`${packName}.mcstructure`, structureData)

    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' })
    // Set proper MIME type for mcpack format (application/zip or custom mcpack type)
    const mcpackBlob = new Blob([blob], { type: 'application/zip' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(mcpackBlob)
    link.download = `${packName}.mcpack`
    
    // For iOS compatibility, we need to trigger the download differently
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // iOS approach: set the href and let the browser handle it
      link.setAttribute('download', `${packName}.mcpack`)
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const createStructureFile = (blocks: BlockColor[][], palette: BlockColor[]): ArrayBuffer => {
    // Minecraft structure format NBT encoding (simplified for block placement)
    const width = blocks[0].length
    const height = blocks.length
    const length = 1 // Single layer

    // Create a simple byte array representation
    // Format: [width, height, length, ...block_data]
    const buffer = new ArrayBuffer(4 + width * height * length)
    const view = new Uint8Array(buffer)

    // Write dimensions
    view[0] = width
    view[1] = height
    view[2] = length
    view[3] = 0

    // Write block indices
    let offset = 4
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const blockColor = blocks[y][x]
        const paletteIndex = palette.findIndex(c => c.name === blockColor.name)
        view[offset++] = Math.max(0, paletteIndex)
      }
    }

    return buffer
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-center">Minecraft Photo Converter</h1>
        <p className="text-center text-gray-600">Convert your photo to a Minecraft pixel art schematic</p>
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

      {image && (
        <>
          {/* Size and Palette Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-semibold text-sm">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as Size)}
                className="w-full border border-gray-300 rounded-lg p-2 bg-white"
              >
                {Object.entries(SIZES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.display}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-sm">Palette</label>
              <select
                value={palette}
                onChange={(e) => setPalette(e.target.value as Palette)}
                className="w-full border border-gray-300 rounded-lg p-2 bg-white"
              >
                {Object.entries(PALETTES).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-side Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Photo */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Original Photo</h3>
              <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
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
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }}
                />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleZoom('in')}
                  className="bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-2 rounded transition text-xs"
                >
                  Zoom In
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-2 rounded transition text-xs"
                >
                  Zoom Out
                </button>
                <button
                  onClick={handleFitSquare}
                  className="bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-2 rounded transition text-xs"
                >
                  Fit Square
                </button>
              </div>
            </div>

            {/* Minecraft Preview */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Minecraft Pixel Art Preview</h3>
              {blockData.length > 0 ? (
                <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                  <canvas
                    ref={previewCanvasRef}
                    width={canvasSize}
                    height={canvasSize}
                    className="border border-gray-300 rounded bg-white"
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px', imageRendering: 'pixelated' }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-50 p-12 rounded-lg text-gray-500 text-sm h-80">
                  Preview will appear here once you position your photo
                </div>
              )}
              {blockData.length > 0 && (
                <p className="text-xs text-gray-600">
                  {blockData.length}x{blockData[0].length} blocks • {PALETTES[palette].label}
                </p>
              )}
            </div>
          </div>

          {/* Preview Stats and Save */}
          {blockData.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Pack Name Input */}
                <div className="space-y-2">
                  <label className="block font-semibold text-sm">Pack Name</label>
                  <input
                    type="text"
                    value={packName}
                    onChange={(e) => {
                      const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, '')
                      setPackName(newValue)
                    }}
                    placeholder="minecraft-photo"
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  />
                  <p className="text-xs text-gray-500">Only letters, numbers, hyphens, and underscores allowed</p>
                </div>

                {/* Color Legend */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Colors Used</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
                    {Array.from(
                      new Map(
                        blockData.flat().map(block => [block.name, block])
                      ).values()
                    ).map(block => (
                      <div key={block.name} className="flex flex-col items-center gap-1">
                        <div
                          className="w-8 h-8 border border-gray-300 rounded"
                          style={{ backgroundColor: block.hex }}
                        />
                        <span className="truncate text-center">{block.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Save as .mcpack
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
            <p><strong>Step 1:</strong> Position your photo using drag and zoom controls</p>
            <p><strong>Step 2:</strong> Choose a size and palette for your Minecraft blocks</p>
            <p><strong>Step 3:</strong> Watch the preview update automatically</p>
            <p><strong>Step 4:</strong> Click "Save as JSON" to download the schematic data</p>
          </div>
        </>
      )}
    </div>
  )
}
