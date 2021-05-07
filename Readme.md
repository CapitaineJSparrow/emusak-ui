# Emusak UI

Emusak-ui is a graphical mod for [Emusak](https://github.com/sinscove/EmuSAK). This is a tool which allows you to download saves and shaders for switch emulators using a compatible Emusak backend compatible both with linux (only tested with ubuntu) and windows 

<p align="center">
  <img width="80%" alt="screenshot" src="https://raw.githubusercontent.com/stromcon/emusak-ui/main/screenshot.jpg?raw=true" />
</p>


### Installation

Just go to [releases](https://github.com/stromcon/emusak-ui/releases) page and download latest build

#### Windows

install the software just by executing the `.exe` file. You can remove the software like any program on your computer then. **Only on windows** There is an auto update feature

#### Linux

Download deb file from [releases](https://github.com/stromcon/emusak-ui/releases) `sudo dpkg -i ./emusak-ui-X.Y_amd64.deb` I'll create a ppa and aur package for linux users soon

### Features

* Add one or multiple Ryujinx folders (where `Ryujinx.exe` is located) to manage mainline, portable and LDN build if any
* List your game library
* Display your local shaders count & emusak shaders count (to download them if you have fewer shaders)
* Update firmware
* Update production keys
* Download save for specific game
* Download shaders for specific game

Todo :

- [ ] Download saves
- [ ] Add yuzu support

### Contributing

Requirements :

* NodeJS v14+
* Yarn `npm i -g yarn`

Set a valid EmuSAK backend URL in a variable :

```
(powershell): $Env:EMUSAK_URL = 'http://...'
(bash): export EMUSAK_URL = 'http://...'
```

Install & run 

```
yarn install
yarn dump-games
yarn dev
```

### Thanks 

* Sin for creating a nice community and init the ideas
* Niwu for testing, suggestions and help me to match switch title IDs to game name
* Joshi to update the backend to create a nice software
