# Xpict

Xpict é uma biblioteca para a geração de imagens padronizadas a partir de modelos declarativos.

## Instalação 

```bash
npm install xpict
```

## Uso

```typescript
import xpict from "xpict"

const template = xpict.template({ // para criar um template
    config: {
        width: 100, // para definir a largura da imagem
        height: 100, // para definir a altura da imagem
        fill: "#fff" // para definir a cor de fundo da imagem
    },
    layers: [
        xpict.rectangle({...}), // para inserir um retângulo
        xpict.circle({...}), // para inserir um círculo
        xpict.line({...}), // para inserir uma linha
        xpict.text({...}), // para inserir texto
        xpict.image({...}), // para inserir uma imagem
        xpict.repeat({...}), // para repetir um tipo de camada com base em itens de um array
        xpict.group({...}) // para agrupar camadas que compoem algo maior
    ]
})

const image = await template.render({...}) // para renderizar a imagem passando os dados de entrada
```

