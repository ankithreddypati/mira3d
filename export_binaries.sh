
#!/bin/bash
set -euo pipefail

echo " Creating export directories..."
mkdir -p export/{colmap,ffmpeg,imagemagick,brush,vulkan}/{bin,lib,icd.d}

########################################
# COLMAP
########################################
if command -v colmap &>/dev/null; then
    echo " Exporting COLMAP..."
    cp "$(which colmap)" export/colmap/bin/
    ldd "$(which colmap)" | awk '/=>/ {print $3}' | xargs -r -I{} cp -v {} export/colmap/lib/
else
    echo "  COLMAP not found, skipping..."
fi

########################################
# FFmpeg
########################################
if command -v ffmpeg &>/dev/null; then
    echo " Exporting FFmpeg..."
    cp "$(which ffmpeg)" export/ffmpeg/bin/
    ldd "$(which ffmpeg)" | awk '/=>/ {print $3}' | xargs -r -I{} cp -v {} export/ffmpeg/lib/
else
    echo "  FFmpeg not found, skipping..."
fi

########################################
# ImageMagick
########################################
if command -v convert &>/dev/null; then
    echo " Exporting ImageMagick..."
    cp "$(which convert)" export/imagemagick/bin/
    ldd "$(which convert)" | awk '/=>/ {print $3}' | xargs -r -I{} cp -v {} export/imagemagick/lib/
else
    echo "  convert not found, skipping..."
fi

########################################
# Brush
########################################
BRUSH_BIN="$HOME/brush/target/release/brush_app"
if [ -x "$BRUSH_BIN" ]; then
    echo " Exporting Brush..."
    cp "$BRUSH_BIN" export/brush/bin/
    ldd "$BRUSH_BIN" | awk '/=>/ {print $3}' | xargs -r -I{} cp -v {} export/brush/lib/
else
    echo "  Brush binary not found, skipping..."
fi

########################################
# Vulkan Export - Clean NVIDIA-Only Setup
########################################

echo " Exporting Vulkan tools and drivers..."

# 1. Export vulkaninfo (if available)
if command -v vulkaninfo &>/dev/null; then
    echo " Exporting vulkaninfo..."
    cp "$(which vulkaninfo)" export/vulkan/bin/
    ldd "$(which vulkaninfo)" | awk '/=>/ {print $3}' | xargs -r -I{} cp -v {} export/vulkan/lib/
else
    echo "  vulkaninfo not found, skipping..."
fi

# 2. Export Vulkan loader (libvulkan.so.1)
LOADER=$(ldconfig -p | grep 'libvulkan.so.1' | awk '{print $NF}' | head -n1)
if [ -n "$LOADER" ] && [ -f "$LOADER" ]; then
    echo " Copying Vulkan loader: $LOADER"
    cp -v "$LOADER" export/vulkan/lib/
else
    echo "  Vulkan loader libvulkan.so.1 not found."
fi

# 3. Export NVIDIA ICD driver and its dependencies
echo " Looking for NVIDIA Vulkan ICD library..."
NVIDIA_SO=$(ldconfig -p | grep -F 'libGLX_nvidia.so.0' | awk '{print $NF}' | head -n1)

if [[ -n "$NVIDIA_SO" && -f "$NVIDIA_SO" ]]; then
    echo " Found NVIDIA ICD library: $NVIDIA_SO"
    cp -v "$NVIDIA_SO" export/vulkan/lib/

    echo " Copying dependencies of $NVIDIA_SO..."
    ldd "$NVIDIA_SO" | awk '/=>/ {print $3}' | xargs -r -I{} cp -v {} export/vulkan/lib/

    ICD_NAME=$(basename "$NVIDIA_SO")

    echo " Writing ICD JSON file..."
    cat > export/vulkan/icd.d/nvidia_icd.json <<EOF
{
    "file_format_version": "1.0.0",
    "ICD": {
        "library_path": "$ICD_NAME",
        "api_version": "1.3.277"
    }
}
EOF
else
    echo " NVIDIA libGLX_nvidia.so.0 not found — skipping Vulkan ICD export."
fi

echo " Vulkan export complete!"
