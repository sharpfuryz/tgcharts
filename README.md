# Charting library
![Iphone screenshot](img/iphone.png?raw=true "Iphone screenshot")
## Why?
Once upon a time I was sitting and reading a book, suddenly telegram dropped to me a message about the competition which aims to develop charting library - I decided to participate, because for the last six months I had been working on charts. You can see results in this repo.
```
1) yarn
2) yarn build
3) yarn serve
```
## Details
* Main chart and preview draw over the canvas because it is fast.
* Axis ticks (ticks labels) is rendered as <text> in SVG layer, because.
* Controls is DOM checkboxes with some animations
* Sizes of elements will vary on desktop and mobile devices. On desktop you will have horizontal rectangle, on handheld - vertical
### Dependencies
* Empty! Only vanilla js, only hardcore
### Size
* Styles - 2 kB
* Code - 16 kB
* Total: 18 kB
### Efficiency
* Less than 1ms to render a frame (according to performance meter in chrome dev tools)