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
    "postMake": async (_, makeResults) => {
      const version = makeResults[0].packageJSON.version;
      const portablePath = makeResults.map(b => b.artifacts).flat().find(i => i.includes(".zip") && i.includes("win32"));
      const exePath = makeResults.map(b => b.artifacts).flat().find(i => i.includes("Setup.exe"));

      try {
        if (portablePath) {
          const filename = path.basename(portablePath);
          await fs.move(portablePath, portablePath.replace(filename, `EmuSAK-win32-x64-${version}-portable.zip`))
        }

        if (exePath) {
          const filename = path.basename(exePath);
          await fs.move(exePath, exePath.replace(filename, `EmuSAK-win32-x64-${version}-installer-recommended.exe`))
        }
      } catch(e) {
        // fs.move is launched twice, first for dry run and second time by make from dry-run causing an exception, so ignore and assume it exists
      }

      try {
        if (exePath) {
          const filename = path.basename(exePath);
          await fs.move(exePath, exePath.replace(filename, `EmuSAK-win32-x64-${version}-installer-recommended.exe`))
        }
      } catch(e) {}

      console.log(makeResults.map(r => ({
        ...r,
        ...{
          artifacts:
            r.artifacts.map(fullPath => {
              const filename = path.basename(fullPath);

              if (fullPath.includes(".zip") && fullPath.includes("win32")) {
                return fullPath.replace(filename, `EmuSAK-win32-x64-${version}-portable.zip`);
              }

              if (fullPath.includes(".exe")) {
                return fullPath.replace(filename, `EmuSAK-win32-x64-${version}-installer-recommended.exe`);
              }

              return fullPath;
            })
        }
      })))

      return makeResults.map(r => ({
        ...r,
        ...{
          artifacts:
            r.artifacts.map(fullPath => {
              const filename = path.basename(fullPath);

              if (fullPath.includes(".zip") && fullPath.includes("win32")) {
                return fullPath.replace(filename, `EmuSAK-win32-x64-${version}-portable.zip`);
              }

              if (fullPath.includes(".exe")) {
                return fullPath.replace(filename, `EmuSAK-win32-x64-${version}-installer-recommended.exe`);
              }

              return fullPath;
            })
        }
      }))
    }
  }
};
