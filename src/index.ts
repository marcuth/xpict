import {
    GroupLayer,
    RepeatLayer,
    GroupLayerOptions,
    ImageLayer,
    ImageLayerOptions,
    LineLayer,
    LineLayerOptions,
    RectangleLayer,
    RectangleLayerOptions,
    RepeatLayerOptions,
    TextLayer,
    TextLayerOptions,
    CircleLayerOptions,
    CircleLayer,
} from "./layers"
import { negativeEffect, blurEffect, grayscaleEffect } from "./effects"
import { Template, InputTemplateOptions } from "./template"

export * from "./layers"
export * from "./effects"
export * from "./template"
export * from "./utils"

const xpict = {
    rectangle<Data>(options: RectangleLayerOptions<Data>) {
        return new RectangleLayer<Data>(options)
    },
    circle<Data>(options: CircleLayerOptions<Data>) {
        return new CircleLayer<Data>(options)
    },
    text<Data>(options: TextLayerOptions<Data>) {
        return new TextLayer<Data>(options)
    },
    image<Data>(options: ImageLayerOptions<Data>) {
        return new ImageLayer<Data>(options)
    },
    repeat<Data, Item>(options: RepeatLayerOptions<Data, Item>) {
        return new RepeatLayer<Data, Item>(options)
    },
    group<Data>(options: GroupLayerOptions<Data>) {
        return new GroupLayer<Data>(options)
    },
    line<Data>(options: LineLayerOptions<Data>) {
        return new LineLayer<Data>(options)
    },
    template<Data>(options: InputTemplateOptions<Data>) {
        return new Template<Data>(options)
    },
    effects: {
        negative: negativeEffect,
        blur: blurEffect,
        grayscale: grayscaleEffect,
    },
}

export default xpict
