const fs = require("fs-extra");
const path = require("path");

module.exports = {
  "forge": "./forge.config.js",
  "packagerConfig": {
    "icon": "./icons/win/icon.ico",
    "executableName": "EmuSAK"
  },
  "publishers": [
    {
      "name": "@electron-forge/publisher-github",
      "config": {
        "repository": {
          "owner": "CapitaineJSparrow",
          "name": "emusak-ui"
        }
      }
    }
  ],
  "makers": [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "name": "emusak_ui"
      }
    },
    {
      "name": "@electron-forge/maker-zip",
      "platforms": [
        "win32"
      ]
    },
    {
      "name": "@electron-forge/maker-deb",
      "config": {}
    },
    {
      "name": "@electron-forge/maker-rpm",
      "config": {}
    },
    {
      "name": "electron-forge-maker-appimage",
      "platforms": [
        "linux"
      ],
      "config": {}
    }
  ],
  "plugins": [
    [
      "@electron-forge/plugin-webpack",
      {
        "mainConfig": "./webpack.main.config.js",
        "renderer": {
          "config": "./webpack.renderer.config.js",
          "entryPoints": [
            {
              "html": "./src/index.html",
              "js": "./src/renderer.ts",
              "name": "main_window"
            }
          ]
        }
      }
    ]
  ],
  "hooks": {
    "postMake": async (_, artifacts) => {
      const portablePath = artifacts.map(b => b.artifacts).flat().find(i => i.includes(".zip") && i.includes("win32"));

      try {
        if (portablePath) {
          const filename = path.basename(portablePath);
          console.log({ filename })
          await fs.move(portablePath, portablePath.replace(filename, "EmuSAK-win32-x64-2.0.0-portable.zip"))
        }
      } catch(e) {

      }
    }
  }
};
