# Xpict

**Xpict** is a library built on top of `@napi-rs/canvas` designed to create templates for generating standardized images with data—which can be static or dynamic. It features support for conditional rendering, runtime-generated position axes, and dynamic text.

## 📦 Installation

Installation is straightforward; just use your preferred package manager. Here is an example using NPM:

```bash
npm i xpict

```

## 🚀 Usage

<a href="https://www.buymeacoffee.com/marcuth">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200">
</a>

### Template

The foundation for creating images in Xpict is the `Template`. This is where you define your image layers and encapsulate all assembly logic. There are two ways to define an initial `Template`.

**Using the config property (width, height, and fill):**

```ts
import xpict from "xpict"

type RenderData = {} // Your data structure used in layer logic

const template = xpict.template<RenderData>({
    config: {
        width: 1280,
        height: 720,
        fill: "#020817" // optional
    },
    layers: [...]
})

```

**Using an image as a background:**

```ts
import xpict from "xpict"

type RenderData = {} // Your data structure used in layer logic

const template = xpict.template<RenderData>({
    imagePath: "path/to/background.png",
    layers: [...]
})

```

---

### Layers

Layers are another fundamental component of Xpict. They act as building blocks—sometimes functional, sometimes just wrappers—that organize code declaratively and provide instructions to `@napi-rs/canvas` on how to perform operations within our canvas context.

All axes (x, y) across all layer types support dynamic values:

```ts
x: ({ data, index /* index is useful if you are inside a `RepeatLayer` loop */ }) => index * 110,
y: ({ data, index /* index is useful if you are inside a `RepeatLayer` loop */ }) => index * 50,

```

Every layer also supports conditional rendering via the `when` property. If not defined, the layer renders by default.

```ts
when: ({ data, index }) => false // must return a boolean

```

#### TextLayer

To insert text into the canvas, use `TextLayer`:

```ts
import xpict from "xpict"

const myFont = xpict.utils.font({
    name: "curse-casual",
    filePath: "path/to/font.ttf",
    color: "#ffffff",
})

type RenderData = {} 

const template = xpict.template<RenderData>({
    config: {
        width: 1280,
        height: 720,
        fill: "#020817"
    },
    layers: [
        xpict.text({
            x: 640,
            y: 360,
            font: myFont({
                size: 60,
                color: "#ffffff" // optional, as it was previously defined in font config
            }),
            text: "Hello World",
            align: "center", // optional
            baseline: "middle", // optional
            stroke: {
                width: 4,
                fill: "#000000"
            } // optional
        })
    ]
})

```

**Using dynamic text:**

```ts
text: ({ data, index }) => data.myText

```

---

#### ImageLayer

To insert images into the canvas, use `ImageLayer`:

```ts
import xpict from "xpict"

const template = xpict.template<RenderData>({
    config: {
        width: 1280,
        height: 720,
        fill: "#020817"
    },
    layers: [
        xpict.image({
            src: "path/to/image.png",
            x: 0,
            y: 0,
        }),
    ]
})

```

**Using a dynamic image:**

```ts
src: ({ data, index }) => data.myImagePath

```

---

#### RectangleLayer

To insert rectangles into the canvas, use `RectangleLayer`:

```ts
xpict.rectangle({
    x: 0,
    y: 0,
    fill: "#ffffff",
    width: 150,
    height: 50,
    borderRadius: 5 // optional
})

```

---

#### CircleLayer

To insert circles into the canvas, use `CircleLayer`:

```ts
xpict.circle({
    x: 0,
    y: 0,
    fill: "#ffffff",
    radius: 50,
})

```

---

#### LineLayer

To insert lines into the canvas, use `LineLayer`:

```ts
xpict.line({
    from: { x: 0, y: 0 },
    to: { x: 0, y: 50 },
    color: "#ffffff",
    width: 1
})

```

---

#### GroupLayer

If you want to group layers that share a common context, you can use `GroupLayer` to keep your code organized and apply an offset if desired:

```ts
xpict.group({
    x: 50,
    y: 50,
    layers: [...]
})

```

---

#### RepeatLayer

If you need to handle arrays to generate layers, use `RepeatLayer` to organize your code and loop logic:

```ts
xpict.repeat({
    each: ({ data }) => data.images,
    x: ({ index }) => index * 50,
    y: ({ index }) => index * 50,
    layer: (image, { index, length }) => xpict.image({
        x: 0,
        y: 0,
        src: image
    })
})

```

---

### Image Transformations and Effects

If you want to manipulate an image or apply effects, you can do so using the `transform` property of `ImageLayer`, or via `flipX`, `flipY`, and `rotate`.

**Using transform:**

```ts
xpict.image({
    x: 0,
    y: 0,
    src: "...",
    transform: [
        xpict.effects.blur(2.5),
        ({ canvas, ctx, data, index }) => {
            // manipulate the `ctx` directly here to apply custom logic
        }
    ]
})

```

---

## 🧪 Tests (Not included yet, CONTRIBUTE! :D)

Automated tests are located in `__tests__`. To run them:

```bash
npm run test

```

## 🤝 Contributing

Want to contribute? Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-new`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-new`).
5. Open a Pull Request.

## 📝 License

This project is licensed under the MIT License.