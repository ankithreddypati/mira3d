
#!/bin/bash

echo " Installing ffmpeg, ImageMagick, and COLMAP with CUDA support..."

# Update and install basic tools
sudo apt-get update
sudo apt-get install -y imagemagick ffmpeg

# Install COLMAP dependencies
sudo apt-get install -y \
    git \
    cmake \
    ninja-build \
    build-essential \
    libboost-program-options-dev \
    libboost-filesystem-dev \
    libboost-graph-dev \
    libboost-system-dev \
    libeigen3-dev \
    libflann-dev \
    libfreeimage-dev \
    libmetis-dev \
    libgoogle-glog-dev \
    libgtest-dev \
    libgmock-dev \
    libsqlite3-dev \
    libglew-dev \
    qtbase5-dev \
    libqt5opengl5-dev \
    libcgal-dev \
    libceres-dev \
    vulkan-tools

# Clone and build COLMAP with CUDA
cd $HOME
git clone https://github.com/colmap/colmap.git
cd colmap
mkdir build && cd build

# Adjust CUDA architecture as needed
echo "Building COLMAP with CUDA architecture 89..."
cmake .. -GNinja -DCMAKE_CUDA_ARCHITECTURES=89
ninja

echo " Installing COLMAP..."
sudo ninja install

# Return to home directory
cd $HOME

# Install Rust (non-interactive)
echo " Installing Rust..."
curl https://sh.rustup.rs -sSf | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version

# Clone and build Brush
echo " Cloning and building Brush..."
git clone https://github.com/ArthurBrussee/brush.git
cd brush
cargo build --release

# Print path to Brush binary
BRUSH_BINARY="$HOME/brush/target/release/brush"
echo " Brush built successfully. Binary is located at:"
echo "$BRUSH_BINARY"

# Final verification
echo "🔍 Verifying installations:"
colmap -h | head -5
ffmpeg -version | head -1
convert -version | head -1

echo " Setup complete! COLMAP and Brush are installed."

