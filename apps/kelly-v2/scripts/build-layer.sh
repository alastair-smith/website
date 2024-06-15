#!/bin/bash

# intended to be ran in docker image amazonlinux

# podman run --rm -it -v $(pwd):/app -w /app docker.io/amazonlinux:latest /bin/bash

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NO_COLOR='\033[0m'

NVM_VERSION="v0.39.1"
NODE_VERSION="20.12.2"

yellow_echo() {
  echo -e "${YELLOW}${@}${NO_COLOR}"
}

green_echo() {
  echo -e "${GREEN}${@}${NO_COLOR}"
}

yellow_echo "Configuring variables..."

WORKING_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
LAYER_DIR="$WORKING_DIR/layer"
BIN_LAYER_DIR="lib/"
BIN_LAYER_FULL_DIR="$LAYER_DIR/$BIN_LAYER_DIR"
NODE_LAYER_DIR="nodejs/"
NODE_LAYER_FULL_DIR="$LAYER_DIR/$NODE_LAYER_DIR"
BIN_IMAGE_DIR="/usr/lib64"
FONTS_LAYER_DIR="fonts/"
FONTS_LAYER_FULL_DIR="$LAYER_DIR/$FONTS_LAYER_DIR"
ARCHIVE_OUTPUT="$WORKING_DIR/layer.zip"
GIFSICLE_FULL_DIR="/opt/gifsicle"

yellow_echo "Configured variables"
yellow_echo "Creating directories..."

rm -rf "$LAYER_DIR"
rm -f "$ARCHIVE_OUTPUT"
mkdir -p "$BIN_LAYER_FULL_DIR"
mkdir -p "$NODE_LAYER_FULL_DIR"
mkdir -p "$FONTS_LAYER_FULL_DIR"
mkdir -p "$GIFSICLE_FULL_DIR"

yellow_echo "Created directories"
yellow_echo "Installing yum packages..."

# amazon-linux-extras install epel -y

yum install -y \
  gcc-c++ \
  cairo-devel \
  libjpeg-turbo-devel \
  pango-devel \
  giflib-devel \
  tar \
  gzip \
  zip \
  tar \
  gzip

cd "$GIFSICLE_FULL_DIR"
curl https://www.lcdf.org/gifsicle/gifsicle-1.95.tar.gz -o gifsicle.tar.gz
tar -xzf gifsicle.tar.gz
cd gifsicle-1.95
./configure
make install

yellow_echo "Installed yum packages"
yellow_echo "Installing nodejs..."

cd /opt
curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || echo "supressing failure"
echo "Installed nvm, installing node: $NODE_VERSION"
nvm install "$NODE_VERSION"

yellow_echo "Installed nodejs"
yellow_echo "Copying binaries..."

cp "$BIN_IMAGE_DIR/libblkid.so.1" \
  "$BIN_IMAGE_DIR/libmount.so.1" \
  "$BIN_IMAGE_DIR/libuuid.so.1" \
  "$BIN_IMAGE_DIR/libfontconfig.so.1" \
  "$BIN_IMAGE_DIR/libpixman-1.so.0" \
  "$BIN_LAYER_FULL_DIR"

cp "/usr/local/bin/gifsicle" "$BIN_LAYER_FULL_DIR"

yellow_echo "Copied binaries"
yellow_echo "Installing node modules..."

cd "$NODE_LAYER_FULL_DIR"
npm init -y
npm i canvas@2.11.2
rm "package.json" "package-lock.json"

yellow_echo "Installed node modules"
yellow_echo "Installing fonts..."

curl -o "LibreBaskerville-Regular.otf" -s "https://raw.githubusercontent.com/impallari/Libre-Baskerville/master/src/LibreBaskerville-Regular.otf"
cp "LibreBaskerville-Regular.otf" "$FONTS_LAYER_FULL_DIR"
cp "$WORKING_DIR/fonts.conf" "$FONTS_LAYER_FULL_DIR"

yellow_echo "Installed fonts"
yellow_echo "Creating archive"

cd "$LAYER_DIR"
zip -r "$ARCHIVE_OUTPUT" "$BIN_LAYER_DIR" "$NODE_LAYER_DIR" "$FONTS_LAYER_DIR"

yellow_echo "Created archive"
yellow_echo "Cleaning up workspace..."

rm -r "$LAYER_DIR"

yellow_echo "Cleaned up workspace"
green_echo "Build complete"
