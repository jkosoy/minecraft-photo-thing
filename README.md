# Minecraft Photo Thing

Convert your photos into Minecraft Bedrock Edition pixel art using command blocks!

## Features

- 🎨 Convert any image to Minecraft pixel art
- 📦 Generates Bedrock Edition behavior packs with functions
- 🎮 Compatible with Minecraft Bedrock Edition (1.19+)
- 📱 Works on mobile and desktop
- 🔧 Customizable size (32x32, 64x64, 128x128)
- 🌈 Expanded color palette with concrete, wool, and terracotta blocks

## How It Works

1. **Choose a photo** - Upload any image you want to convert
2. **Position it** - Drag and zoom to fit your image in the square canvas
3. **Select size** - Choose from small (32x32), medium (64x64), or large (128x128)
4. **Preview** - See the Minecraft pixel art preview in real-time
5. **Download** - Save as a `.mcpack` behavior pack

## Installation in Minecraft Bedrock

1. Download the generated `.mcpack` file
2. Open the file on your device (double-click on PC, tap on mobile)
3. Minecraft will automatically import the behavior pack
4. Create a new world or open an existing one
5. Enable the behavior pack in world settings

## Using the Pixel Art Function

Once the behavior pack is enabled in your world:

1. Stand where you want the pixel art to appear
2. Open the chat
3. Type: `/function <pack-name>` (where `<pack-name>` is the name you gave your pack)
4. The pixel art will be generated starting from your position

**Note:** The pixel art will be placed as a vertical wall using relative coordinates:
- X-axis: extends to your right
- Y-axis: extends upward
- Z-axis: one block thick (at your current position)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Technical Details

### Behavior Pack Structure

The generated `.mcpack` contains:
- `manifest.json` - Behavior pack metadata
- `functions/<pack-name>.mcfunction` - Commands to build the pixel art
- `pack_icon.png` - Preview icon

### Function Format

The `.mcfunction` file contains `setblock` commands using relative coordinates:
```
setblock ~0 ~0 ~ red_concrete
setblock ~1 ~0 ~ blue_concrete
...
```

Each command places one block at a position relative to where the function is executed.

## License

MIT
