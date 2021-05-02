# Emusak UI

Emusak-ui is a graphical mod for [Emusak](https://github.com/sinscove/EmuSAK). This tool can manage your switch emulators game library to manage your firmware, keys, save & shaders using a compatible Emusak backend

![Screenshot](https://github.com/stromcon/emusak-ui/blob/main/screenshot.png?raw=true)

Requirements :

* NodeJS v14+
* Yarn `npm i -g yarn`

Set a valid EmuSAK backend URL in a variable :

```
(powershell): $Env:EMUSAK_URL = 'http://...'
```

Install & run 

```
yarn install
yarn dump-games
yarn dev
```
