# Mira3D

**Mira3D** is a 3D reconstruction application that generates consistent, high-quality 3D point clouds from 2D videos using photogrammetry and Gaussian splatting techniques. Optimized for fast, secure, on-premises AI workflows using HP AI Studio and NVIDIA GPUs.


![Demo 1](assets/demo1.png)
![Demo 2](assets/demo2.png)
![Demo 3](assets/demo3.png)

## ✨ Features

- **AI-Powered Background Removal**: Intelligent preprocessing using U2Net model for cleaner reconstructions
- **Video-to-3D Conversion**: Transform 2D videos into detailed 3D point clouds
- **Gaussian Splatting**: Advanced 3D reconstruction using state-of-the-art techniques
- **GPU Acceleration**: Optimized for NVIDIA GPUs with CUDA support
- **Real-time Processing**: Fast reconstruction pipeline for efficient workflows
- **Web Interface**: Interactive editor for viewing and exporting 3D models

##  Use Cases

Mira3D AI enhanced 3D reconstructions can be applied across multiple industries:

- 🏗️ **Architecture, Engineering & Construction (AEC)** – Room scans, building documentation, Heavy equipment without background
- 🏛️ **Cultural Heritage** – Scanning and preserving historical monuments
- 🛍️ **Retail** – 3D product models and virtual try-on experiences
- 📸 **Photography & Film** – Environment capture and visual effects
- 🏭 **Manufacturing** –  Quality control and part documentation with isolated object reconstruction

##  Quick Start

### Prerequisites

- HP AI Studio with Deep Learning Image
- NVIDIA GPU with CUDA support
- Ubuntu 22.04+ (recommended)

### Add the Birefnet Model

- Download the Birefnet.onnx via Models tab:

  * **Model Name**: `Birefnet-general`
  * **Model Source**: `AWS S3`
  * **S3 URI**: `s3://miramodels/birefnet-general`
  * **Bucket Region**: `us-east-1`

![Download Model](assets/modeldemo.png)


### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Mira3D
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   This installs:
   - COLMAP with CUDA support
   - FFmpeg
   - ImageMagick (for image processing)
   - Brush rendering engine
   
   > **Note**: Installation may take several minutes depending on your hardware and internet connection.

3. **Verify installation**
   ```bash
   colmap -h
   ffmpeg -version
   ```

4. **Configure Vulkan (if needed)**
   
   Check if your GPU is properly detected:
   ```bash
   vulkaninfo | grep deviceName
   ```
   
   If you see `deviceName = llvmpipe (LLVM 15.0.7, 256 bits)` instead of your GPU, follow these steps:
   
   a. Copy the Vulkan ICD file from your host system:
   ```bash
   # On host machine your pc not hp ai studio
   ls /usr/share/vulkan/icd.d/
   cp /usr/share/vulkan/icd.d/nvidia_icd.json ~/Downloads/
   ```
   
   b. Drag and drop the file to your container, then run:
   ```bash
   sudo mkdir -p /usr/share/vulkan/icd.d
   sudo cp ~/nvidia_icd.json /usr/share/vulkan/icd.d/
   export VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/nvidia_icd.json
   ```
   
   c. Verify GPU detection:
   ```bash
   vulkaninfo | grep deviceName
   ```
   You should see something like: `deviceName = NVIDIA GeForce RTX 5070`

5. **Export binaries for persistence**
   ```bash
   chmod +x export_binaries.sh
   ./export_binaries.sh
   ```
   This stores runtime dependencies as MLflow artifacts for HP AI Studio persistence.

### Running the Application

1. **If you want to understand more about gaussain splatting before deploying on MLFLOW**
   ```bash
   cd notebooks
   # Run gaussiansplattest.ipynb to understand the workflow
   ```

2. **To Launch the main application**
   ```bash
   cd notebooks
   # Run 3dreconstructionpipeline.ipynb
   # Click on the generated URL to access the web interface
   ```

3. **Deploy to HP AI Studio**
   - Navigate to the Deployments page in HP AI Studio
   - Click on the provided URL to access the application
   - Try the demonstration at the top of the page

##  Usage

1. **Upload a video** through the web interface
2. **Wait for processing** – the system will generate a Gaussian splat
3. **View and edit** your 3D model in the interactive editor
4. **Export your splat** and view it in the gallery

## My Development Environment

- **Platform**: HP AI Studio (Deep Learning Image)
- **OS**: Ubuntu 22.04.5 LTS
- **GPU**: NVIDIA RTX 5070
- **CUDA Version**: 12.8
- **Driver Version**: 570.144

##  Project Structure

```
Mira3D/
├── notebooks/
│   ├── gaussiansplattest.ipynb          # Testing pipeline
│   └── 3dreconstructionpipeline.ipynb   # Main application
│   └── toolchain_mlflowartifact.ipynb   # To test out exported binaries with mlflow artifacts
├── demo                                 # dist folder of frontend to test locally run "serve demo"
├── frontend                             # React three fiber splats viewer
├── setup.sh                             # Installation script
├── export_binaries.sh                   # Binary export script
└── README.md                             
```

##  Troubleshooting

### Common Issues

**GPU not detected for brush**: Follow the Vulkan configuration steps in the installation guide.

**COLMAP errors**: Ensure CUDA is properly installed and your GPU drivers are up to date. when you do colmap -h , you should built with cuda

**Permission errors**: Make sure all scripts have execute permissions:
```bash
chmod +x setup.sh export_binaries.sh
```

**Container persistence**: Use the export script to maintain dependencies across container restarts. I hope there is no use of this from the new update
