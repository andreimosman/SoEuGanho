# Só eu ganho

## O Jogo

### O que é?

Só eu ganho é um jogo de brincadeira onde, apesar das regras simples, quem sabe jogar tem uma vantagem absurda sobre quem não sabe.

### Como jogar?

O jogo começa com 3 linhas: uma com 3, outra com 4 e outra com 5 peças (sachês de condimentos, palitos de fósforo, bolinhas de papel, etc). 

Você só pode retirar peças de uma única linha por vês. Quantas peças quiser, desde que seja de uma única linha.

Ganha quem deixar somente uma peça no tabuleiro.

![screenshot](https://github.com/andreimosman/SoEuGanho/blob/main/screenshot.png?raw=true)

## Inspiração

Essa ideia foi inspirada no jogo MANACE, um Machine Learning usando caixas de fósforo para aprender a jogar Jogo da Velha que conheci no canal Stand-up Maths:
[MENACE: the pile of matchboxes which can learn](https://www.youtube.com/watch?v=R9c-_neaxeU)

Foi utilizada como exemplo em minha palestra ** Muito além dos boletos: PHP para quem quer gostar do que faz ** no [DevPira Festival 2022](https://devpira.com.br/).

## Baixando e rodando aí.

Se você tem o docker-compose é simples:

```
git clone git@github.com:andreimosman/SoEuGanho.git
cd SoEuGanho
./init.sh # <-- isso vai iniciar os containers e instalar as dependências
```

Agora é só acessar o endereço [http://localhost](http://localhost) e jogar.

Estou treinando o bot somente com humanos no endereço [https://soeuganho.com.br/](https://soeuganho.com.br/)


