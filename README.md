# EmuSAK UI

![showDownloads](https://img.shields.io/github/downloads/stromcon/emusak-ui/total?style=for-the-badge)
![showVersion](https://img.shields.io/github/package-json/v/stromcon/emusak-ui?style=for-the-badge)
![showLatestCommit](https://img.shields.io/github/last-commit/stromcon/emusak-ui?style=for-the-badge)
![showLicense](https://img.shields.io/github/license/stromcon/emusak-ui?style=for-the-badge)

EmuSAK-ui is a graphical mod for [EmuSAK](https://github.com/sinscove/EmuSAK). This is a tool to manage your switch emulators, such as downloading saves or mods.

> The `emusak-v2` branch is a WIP rewrite on the project with tons of improvement. This does not reflect what is currently released, if you are looking for the current code check out [`main`](https://github.com/CapitaineJSparrow/emusak-ui/tree/main) branch

<p align="center">
  <img width="80%" alt="screenshot" src="https://raw.githubusercontent.com/stromcon/emusak-ui/emusak-v2/screenshot_1.png" />
</p>


### Installation

Just go to the [releases](https://github.com/stromcon/emusak-ui/releases) page and download the latest build for your OS.
**Only on Windows** there is an auto update feature.

#### Windows

Install the software by executing the `.exe` file. Afterwards, you can remove the software like any other program on your computer.

#### Linux

##### Debian

Download the `.deb` file, then install it with `sudo dpkg -i ./emusak-ui-X.Y_amd64.deb`.

##### Arch Linux

Download [EmuSAK's PKGBUILD](https://aur.archlinux.org/packages/emusak-bin/) and install it with `makepkg -si` or use your favorite AUR helper.

##### Red Hat Linux

Download the `.rpm` file, then install it with `sudo rpm -i /emusak-ui-X.Y-1.x86_64.rpm`.

##### Universal

Download the `.AppImage` file, then mark it as executable and run it.

### Features

* Add one or multiple Ryujinx folders (where `Ryujinx.exe` is located) to manage mainline, portable and LDN build if any
* List your game library
* Display your local shaders count & EmuSAK shaders count (to download them if you have fewer shaders)
* Update firmware
* Update production keys
* Download save for specific game
* Download shaders for specific game
* Downloads mods for specific game
* You can share shaders in just one click if you have more shaders than EmuSAK

Todo :

- [ ] Add shaders download for yuzu
- [ ] Add cloud saves using Google drive if possible
- [ ] Add ryujinx PTC sharing
- [ ] Amiibos for yuzu
- [ ] Notify when there is a game update
- [ ] Add PPA for Ubuntu users

### Contributing

Requirements :

* NodeJS v14+
* Yarn `npm i -g yarn`

Set a valid EmuSAK CDN URL in a variable :

```
(powershell): $Env:EMUSAK_CDN = 'http://...'
(bash): export EMUSAK_CDN = 'http://...'
```

Install & run

```
yarn install
yarn start
```

### Thanks

* Sin for creating a nice community and init the ideas
* Niwu for testing, suggestions and help me to match Switch title IDs to game name
* Joshi for updating the backend to create a nice software
* LiveLM for putting some love to Arch Linux users
