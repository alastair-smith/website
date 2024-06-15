# Website

Code for my personal website [alsmith.dev](https://alsmith.dev).

## Running locally

1. Install the following dependenices

   ```bash
   sudo apt install curl git gifsicle
   snap install aws-cli --classic
   ```

1. Install asdf

   ```bash
   git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
   # using ohmyzsh plugin
   sed -i 's/^plugins=(\(.*\))/plugins=(\1 asdf)/' ~/.zshrc
   ```

1. Install asdf plugins

   ```bash
   asdf plugin-add nodejs
   asdf plugin-add pnpm
   ```

1. Install tools

   ```bash
   asdf install
   ```

1. Install packages

   ```bash
   pnpm install
   ```
