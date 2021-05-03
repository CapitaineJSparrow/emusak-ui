# Emusak UI

Emusak-ui is a graphical mod for [Emusak](https://github.com/sinscove/EmuSAK). This is a tool which allows you to download saves and shaders for switch emulators using a compatible Emusak backend.

### Download

Just go to [releases](https://github.com/stromcon/emusak-ui/releases) page and download latest build

![Screenshot](https://github.com/stromcon/emusak-ui/blob/main/screenshot.jpg?raw=true)

Requirements :

* NodeJS v14+
* Yarn `npm i -g yarn`

Features:

* Add one or multiple Ryujinx folders (where `Ryujinx.exe` is located)
* List your game library
* Display your local shaders count & emusak shaders count (to download them if you have fewer shaders)
* Update firmware
* Update production keys
* Download save for specific game
* Download shaders for specific game

Todo :

- [ ] Download shaders
- [ ] Download saves
- [ ] Add yuzu support

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
