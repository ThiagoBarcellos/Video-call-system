
# Talk to Me!

Talk to me! é um projeto desenvolvido visando o aprendizado de novas tecnologias e novas arquiteturas, como o socket.io e o P2P.
Com o conhecimento adquirido dessas tecnologias, foi desenvolvido um sistema de videochamadas semelhante aos sistemas já consolidados no mercado como o zoom e o google meet. O projeto conta com chamada de vídeo em tempo real, chat funcional e compartilhamento de tela, alem das funcionalidades de silenciar o microfone e desligar a câmera.


## Tabela de Conteúdo

 1. [Stack utilizada](#stack-utilizada)
 2. [Variáveis de Ambiente](#variáveis-de-ambiente)
 3. [Rodando localmente](#rodando-localmente)
 4. [Aprendizados](#aprendizados)

 
## Stack utilizada

**Front-end:** Next.js, TailwindCSS, Socket.io-client, typescript

**Back-end:** Node, Express, Socket.io, typescript


## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env no frontend com a rota e porta em ques está sendo executado seu backend

`NEXT_PUBLIC_API_URL`


## Rodando localmente

Clone o projeto

```bash
  git clone https://github.com/ThiagoBarcellos/Video-call-system.git
```

Entre no diretório do projeto

```bash
  cd Video-call-system
```

### Backend

Entre no diretório do backend

```bash
  cd backend
```

Instale as dependências

```bash
  npm install
```

Inicie o servidor

```bash
  npm run dev
```

### Frontend

Entre no diretório do frontend

```bash
  cd frontend
```

Instale as dependências

```bash
  npm install
```

Inicie a aplicação

```bash
  npm run dev
```


## Aprendizados

Com esse projeto tive contato com ferramentas e uma arquitetura anteriormente desconhecidas. O maior desafio que enfrentei desenvolvendo esse projeto foi entender o fluxo de coneção realizado na aquitetura p2p e implementar esse fluxo utilizando socket.io. Foi um processo bastante exaustivo mas que gerou um resultado acima das expectativas e que abre portas para novos sistemas e aplicações com comunicação em tempo real.