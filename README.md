# SoBoss
Simple Sonos S1 group manager that can run on a Raspberry Pi and any other device that supports the Node.js runtime.

## Build and run
Make sure you have Node.js (and npm, which comes with it) installed and in your PATH.
Run the following commands to build:
```console
# Node.js development environment is required for build
NODE_ENV=development

# Install dependencies
npm ci

# Test source code
npm test

# Build
npm run build

# Start
npm start
```

## Config files
Sample config files are included. Remove the `.sample` part of the file name to make the script use it.