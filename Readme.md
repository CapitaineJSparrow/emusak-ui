# Emusak UI

Emusak-ui is a graphical mod for [Emusak](https://github.com/sinscove/EmuSAK). This is a tool which allows you to download saves and shaders for switch emulators using a compatible Emusak backend.

![Screenshot](https://github.com/stromcon/emusak-ui/blob/main/screenshot.jpg?raw=true)

Requirements :

* NodeJS v14+
* Yarn `npm i -g yarn`

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
