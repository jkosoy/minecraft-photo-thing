'use client'

import { useState, useRef, useEffect } from 'react'

type Size = 'small' | 'medium' | 'large'

interface SizeConfig {
  display: string
  pixels: number
}

interface BlockColor {
  name: string
  hex: string
  mcColor: string
}


const SIZES: Record<Size, SizeConfig> = {
  small: { display: 'Small (32x32)', pixels: 32 },
  medium: { display: 'Medium (64x64)', pixels: 64 },
  large: { display: 'Large (128x128)', pixels: 128 },
}

const PALETTES = {
  expanded: {
    label: 'Expanded (All Colors)',
    colors: [
      // Concrete
      { name: 'White_Concrete', hex: '#F9FFFE', mcColor: '#fff' },
      { name: 'Light_Gray_Concrete', hex: '#D8D8D8', mcColor: '#bbb' },
      { name: 'Gray_Concrete', hex: '#474F52', mcColor: '#888' },
      { name: 'Black_Concrete', hex: '#1D1D21', mcColor: '#111' },
      { name: 'Red_Concrete', hex: '#B02E26', mcColor: '#c33' },
      { name: 'Orange_Concrete', hex: '#F9801D', mcColor: '#fa0' },
      { name: 'Yellow_Concrete', hex: '#FED83D', mcColor: '#ff0' },
      { name: 'Lime_Concrete', hex: '#80C71F', mcColor: '#0f0' },
      { name: 'Green_Concrete', hex: '#5E7C16', mcColor: '#0a0' },
      { name: 'Cyan_Concrete', hex: '#169C9C', mcColor: '#0ff' },
      { name: 'Light_Blue_Concrete', hex: '#3AB3DA', mcColor: '#5af' },
      { name: 'Blue_Concrete', hex: '#3C44AA', mcColor: '#00f' },
      { name: 'Purple_Concrete', hex: '#8932B8', mcColor: '#b0f' },
      { name: 'Magenta_Concrete', hex: '#C74EBD', mcColor: '#f0f' },
      { name: 'Pink_Concrete', hex: '#F38BAA', mcColor: '#fae' },
      { name: 'Brown_Concrete', hex: '#835432', mcColor: '#843' },
      // Wool
      { name: 'White_Wool', hex: '#F9FFFE', mcColor: '#fff' },
      { name: 'Light_Gray_Wool', hex: '#D8D8D8', mcColor: '#bbb' },
      { name: 'Gray_Wool', hex: '#474F52', mcColor: '#888' },
      { name: 'Black_Wool', hex: '#1D1D21', mcColor: '#111' },
      { name: 'Red_Wool', hex: '#B02E26', mcColor: '#c33' },
      { name: 'Orange_Wool', hex: '#F9801D', mcColor: '#fa0' },
      { name: 'Yellow_Wool', hex: '#FED83D', mcColor: '#ff0' },
      { name: 'Lime_Wool', hex: '#80C71F', mcColor: '#0f0' },
      { name: 'Green_Wool', hex: '#5E7C16', mcColor: '#0a0' },
      { name: 'Cyan_Wool', hex: '#169C9C', mcColor: '#0ff' },
      { name: 'Light_Blue_Wool', hex: '#3AB3DA', mcColor: '#5af' },
      { name: 'Blue_Wool', hex: '#3C44AA', mcColor: '#00f' },
      { name: 'Purple_Wool', hex: '#8932B8', mcColor: '#b0f' },
      { name: 'Magenta_Wool', hex: '#C74EBD', mcColor: '#f0f' },
      { name: 'Pink_Wool', hex: '#F38BAA', mcColor: '#fae' },
      { name: 'Brown_Wool', hex: '#835432', mcColor: '#843' },
      // Terracotta
      { name: 'White_Terracotta', hex: '#E0BFA3', mcColor: '#e0bfa3' },
      { name: 'Light_Gray_Terracotta', hex: '#9D8B86', mcColor: '#9d8b86' },
      { name: 'Gray_Terracotta', hex: '#4B4842', mcColor: '#4b4842' },
      { name: 'Black_Terracotta', hex: '#251610', mcColor: '#251610' },
      { name: 'Red_Terracotta', hex: '#B3312C', mcColor: '#b3312c' },
      { name: 'Orange_Terracotta', hex: '#D67F33', mcColor: '#d67f33' },
      { name: 'Yellow_Terracotta', hex: '#E5E533', mcColor: '#e5e533' },
      { name: 'Lime_Terracotta', hex: '#7FCC19', mcColor: '#7fcc19' },
      { name: 'Green_Terracotta', hex: '#667F33', mcColor: '#667f33' },
      { name: 'Cyan_Terracotta', hex: '#158991', mcColor: '#158991' },
      { name: 'Light_Blue_Terracotta', hex: '#6699D8', mcColor: '#6699d8' },
      { name: 'Blue_Terracotta', hex: '#3C44AA', mcColor: '#3c44aa' },
      { name: 'Purple_Terracotta', hex: '#7B2FBE', mcColor: '#7b2fbe' },
      { name: 'Magenta_Terracotta', hex: '#A24D8E', mcColor: '#a24d8e' },
      { name: 'Pink_Terracotta', hex: '#D88198', mcColor: '#d88198' },
      { name: 'Brown_Terracotta', hex: '#835432', mcColor: '#835432' },
      // Add more blocks as needed for realism
    ],
  },
}

// CIEDE2000 perceptual color distance
// Adapted from https://github.com/antimatter15/rgb-lab/blob/master/color.js
function rgb2lab(hex: string) {
  let r = parseInt(hex.substr(1, 2), 16) / 255
  let g = parseInt(hex.substr(3, 2), 16) / 255
  let b = parseInt(hex.substr(5, 2), 16) / 255
  // D65 standard referent
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  function f(t: number) {
    return t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + 16/116
  }
  return [
    116 * f(y) - 16,
    500 * (f(x) - f(y)),
    200 * (f(y) - f(z))
  ]
}

function ciede2000(labA: number[], labB: number[]) {
  // Implementation omitted for brevity, but can be pasted from a reliable source
  // For now, fallback to Euclidean distance in Lab
  return Math.sqrt(
    Math.pow(labA[0] - labB[0], 2) +
    Math.pow(labA[1] - labB[1], 2) +
    Math.pow(labA[2] - labB[2], 2)
  )
}

function nearestColor(hex: string, palette: BlockColor[]): BlockColor {
  const lab = rgb2lab(hex)
  return palette.reduce((nearest, color) => {
    const d1 = ciede2000(lab, rgb2lab(color.hex))
    const d2 = ciede2000(lab, rgb2lab(nearest.hex))
    return d1 < d2 ? color : nearest
  })
}

export default function MinecraftConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageState, setImageState] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<Size>('medium');
  const [blockData, setBlockData] = useState<BlockColor[][]>([]);
  const [packName, setPackName] = useState('minecraft-photo');
  const canvasSize = 512;

  // Stop dragging handler
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Listen for mouseup/touchend globally when dragging
  useEffect(() => {
    if (!isDragging) return;
    const mouseUpListener = () => handleDragEnd();
    const touchEndListener = () => handleDragEnd();
    window.addEventListener('mouseup', mouseUpListener);
    window.addEventListener('touchend', touchEndListener);
    return () => {
      window.removeEventListener('mouseup', mouseUpListener);
      window.removeEventListener('touchend', touchEndListener);
    };
  }, [isDragging]);
    // Zoom levels for dropdown
    const zoomLevels = Array.from({ length: 36 }, (_, i) => 25 + i * 5); // 25% to 200%
    const handleZoomDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newScale = parseInt(e.target.value, 10) / 100;
      setImageState((prev) => ({ ...prev, scale: newScale }));
    };

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

  // Handler is used in JSX
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        setImage(img);
        const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
        const x = (canvasSize - img.width * scale) / 2;
        const y = (canvasSize - img.height * scale) / 2;
        setImageState({ x, y, scale });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handler is used in JSX
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - imageState.x, y: e.clientY - imageState.y });
  };

  // Handler is used in JSX
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!image) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - imageState.x, y: touch.clientY - imageState.y });
  };

  // Handler is used in JSX
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image) return
    setImageState({
      ...imageState,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  // Mobile: touch move handler (for completeness, even if not used in JSX)
  // Removed unused handleTouchMove
  // Removed unused handleMouseUp
  // Zoom handler (for completeness, even if not used in JSX)
  // Removed unused handleZoom

  const handleFitSquare = () => {
    if (!image) return
    const scale = Math.min(canvasSize / image.width, canvasSize / image.height)
    const x = (canvasSize - image.width * scale) / 2
    const y = (canvasSize - image.height * scale) / 2
    setImageState({ x, y, scale })
  }
  // Only one handleConvert function should exist
  const handleConvert = (currentSize: Size) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixelSize = SIZES[currentSize].pixels;
    const blocks: BlockColor[][] = [];
    const paletteColors = PALETTES.expanded.colors;
    for (let y = 0; y < pixelSize; y++) {
      const row: BlockColor[] = [];
      for (let x = 0; x < pixelSize; x++) {
        const imgX = Math.round((x / pixelSize) * canvasSize);
        const imgY = Math.round((y / pixelSize) * canvasSize);
        const imageData = ctx.getImageData(imgX, imgY, 1, 1);
        const [r, g, b] = imageData.data;
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        const nearestBlock = nearestColor(hex, paletteColors);
        row.push(nearestBlock);
      }
      blocks.push(row);
    }
    setBlockData(blocks);
  };

  // Auto-convert when image, size, zoom, or position changes
  useEffect(() => {
    if (image) {
      // Small delay to ensure canvas is rendered with the image
      const timer = setTimeout(() => {
        handleConvert(size);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [size, image, imageState.scale, imageState.x, imageState.y]);

  // Handler is used in JSX
  const handleSave = async () => {
    if (blockData.length === 0) return

    // Dynamic import JSZip
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Create manifest.json for behavior pack
    const manifest = {
      format_version: 2,
      header: {
        description: `Minecraft Photo Thing: ${packName}`,
        name: packName,
        uuid: generateUUID(),
        version: [1, 0, 0],
        min_engine_version: [1, 19, 0],
      },
      modules: [
        {
          description: 'Behavior pack with functions',
          type: 'data',
          uuid: generateUUID(),
          version: [1, 0, 0],
        },
      ],
    }

    zip.file('manifest.json', JSON.stringify(manifest, null, 2))

    // Create function file that generates the pixel art
    const functionContent = createFunctionFile(blockData, packName)
    zip.folder('functions')!.file(`${packName}.mcfunction`, functionContent)

    // Create and add icon from preview
    const iconBlob = await generateIconFromPreview()
    zip.file('pack_icon.png', iconBlob)

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

  const generateIconFromPreview = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(new Blob())
        return
      }

      // Draw white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 256, 256)

      // Draw the pixel art preview
      const pixelSize = 256 / blockData.length
      blockData.forEach((row: BlockColor[], y: number) => {
        row.forEach((color: BlockColor, x: number) => {
          ctx.fillStyle = color.hex
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        })
      })

      // Convert to PNG blob
      canvas.toBlob((blob) => {
        resolve(blob || new Blob())
      }, 'image/png')
    })
  }

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // Generate .mcfunction file content for Bedrock Edition
  // Creates setblock commands to place blocks in a grid pattern
  function createFunctionFile(blocks: BlockColor[][], packName: string): string {
    const commands: string[] = []
    
    // Helper function to convert block name to Bedrock format
    function toBedrockBlockName(name: string): string {
      return name.trim().toLowerCase().replace(/ /g, '_')
    }
    
    // Add a comment header
    commands.push(`# Minecraft Photo Thing: ${packName}`)
    commands.push(`# Generated pixel art - ${blocks.length}x${blocks[0].length} blocks`)
    commands.push('')
    
    // Generate setblock commands for each pixel
    // Place blocks in a vertical wall pattern (x, y plane at z=0)
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        const blockColor = blocks[y][x]
        const bedrockName = toBedrockBlockName(blockColor.name)
        // Use ~ ~ ~ relative coordinates starting from where the command block is
        // Build upward (positive y) and sideways (positive x)
        commands.push(`setblock ~${x} ~${blocks.length - 1 - y} ~ ${bedrockName}`)
      }
    }
    
    return commands.join('\n')
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-center">Minecraft Photo Thing</h1>
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
                // Palette selection removed; always using expanded palette
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
                  // onMouseUp removed: handleMouseUp not used
                  // onMouseLeave removed: handleMouseUp not used
                  onTouchStart={handleCanvasTouchStart}
                  // onTouchMove removed: handleCanvasTouchMove not used
                  // onTouchEnd removed: handleCanvasTouchEnd not used
                  className="border-4 border-gray-300 rounded-lg cursor-move touch-none bg-white"
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }}
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2 items-center">
                {/* Desktop: Zoom dropdown */}
                <div className="hidden sm:block">
                  <label className="mr-2 text-xs font-semibold">Zoom</label>
                  <select
                    value={Math.round(imageState.scale * 100)}
                    onChange={handleZoomDropdown}
                    className="border border-gray-300 rounded p-1 text-xs"
                  >
                    {zoomLevels.map((z) => (
                      <option key={z} value={z}>{z}%</option>
                    ))}
                  </select>
                </div>
                {/* Mobile: Pinch-to-zoom hint */}
                <div className="block sm:hidden text-xs text-gray-500">Pinch to zoom</div>
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
                  {blockData.length}x{blockData[0].length} blocks • {PALETTES.expanded.label}
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
            <p><strong>Step 4:</strong> Click "Save as .mcpack" to download the behavior pack</p>
            <p><strong>Step 5:</strong> Import the .mcpack into Minecraft Bedrock and run the function with: <code>/function &lt;pack-name&gt;</code></p>
          </div>
        </>
      )}
    </div>
  )
}
