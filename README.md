# Mira3D

**Mira3D** is a 3D reconstruction app designed to generate consistent, high-quality 3D point clouds from and 2d videos using photogrammetry and Gaussian splatting techniques. It is optimized for fast, secure, on-prem AI workflows using HP AI Studio and NVIDIA GPUs.

##  Use Cases

Mira3D can be applied across multiple industries:

- 🏗️ **Architecture, Engineering & Construction (AEC)** – Room scans, building documentation
- 🏛️ **Cultural Heritage** – Scanning and preserving historical monuments
- 🛍️ **Retail** – 3D product models and virtual try-on experiences
- 📸 **Photography & Film** – Environment capture and visual effects

---

## 🚀 Quick Start

### 🔧 Setup Instructions

0. Select Image DeepLearning in HP AI Studio
and git clone this repo 

1. Make the setup script executable and run it:

    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

    This will install:
    - COLMAP with CUDA support
    - FFmpeg
    - ImageMagick (for downsampling)
    - Brush 

    > _Note: This step may take time depending on your hardware and connection.

2. Confirm installations:

    ```bash
    colmap -h
    ffmpeg -version
    ```

3. Export required binaries and libraries (for HP AI Studio persistence):

    ```bash
    chmod +x export_binaries.sh
    ./export_binaries.sh
    ```

    This step stores the runtime dependencies as MLflow artifacts to work around non-persistent environments.

---

4. Running the app

cd Notebooks 
run cells in 3dreconstructionpipeline.ipynb 
click on the url to go test the app
Once the pipeline finishes, go to the Deployments page in HP AI Studio
Click on the provided URL to test the app

(To understand more about workflow you can checkoout gaussainsplattingtest.ipynb)


5. Upload a video and wait for splat to be added on the editor 


6. 

## 🖥️ Development Environment

- **Platform**: HP AI Studio (Deep Learning Image)
- **OS**: Ubuntu 22.04.5 LTS
- **GPU**: NVIDIA RTX 5070
- **CUDA Version**: 12.8
- **Driver Version**: 570.144

---



