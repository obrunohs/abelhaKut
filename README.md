# abelhaKut

Versão com interface principal reorganizada.

## Mudanças

- Remove a área grande de amigos da tela principal
- Adiciona botão 👥 Amigos no topo
- Adiciona botão 💬 Conversas no topo
- Balão de conversas fica vermelho com quantidade de conversas não abertas
- Lista de conversas abre o chat correspondente
- Chat agora tem botão de minimizar
- Barra minimizada permite abrir a conversa de volta
- Mantém login, Firebase, amizade, chat, online/offline e notificações reais


## Ajuste desta versão

- Botão 👥 Amigos não mostra mais quantidade total em vermelho.
- O badge vermelho de amigos aparece apenas quando existe solicitação de amizade pendente.
- Painel agora mostra Amigos (quantidade).
- Painel de amigos ganhou botão Fechar.
- Espaço abaixo da foto de perfil reservado para futuras informações.


## Ajustes desta versão

- Evita falso aviso de entrou/saiu quando usuário apenas atualiza a página.
- Evita piscar a tela de login antes do Firebase confirmar sessão.
- Campos de login/cadastro não ficam gravados ao trocar de tela.
- Campo de mensagem com autocomplete desativado para evitar sugestão flutuante.
- Botão de apagar mensagem virou setinha com menu.


## Correções desta versão

- Botão 👥 Amigos não mostra mais badge vermelho.
- Busca de pessoas não repete mais o mesmo usuário várias vezes.
- Menu ⋯ em cada conversa no botão 💬.
- Opção de apagar conversa inteira, removendo mensagens para os dois usuários.
- Setinha de opções aparece em todas as mensagens do chat.
- Apagar mensagem individual remove para todos.


## Ajustes desta versão

- Dentro do chat, só aparece opção de apagar nas próprias mensagens.
- Apagar mensagem individual continua removendo para todos.
- Ao apagar conversa no balão 💬, a conversa sai da lista.
- A conversa volta para a lista quando alguém enviar uma nova mensagem.
- Ao sair da conta, campos de email/senha/login são limpos.


## Ajuste desta versão

- Mensagem recebida não abre mais o chat automaticamente.
- Mensagem recebida aparece na barra lateral inferior direita.
- Clicar na barra da mensagem abre o chat e marca como lida.
- Clicar no balão 💬 remove as notificações de mensagens não lidas.


## Ajuste mobile

- Layout reorganizado para celular sem alterar o desktop.
- Topo em blocos.
- Busca ocupa largura total.
- Perfil e área principal empilhados.
- Dropdowns adaptados para mobile.
- Chat ocupa melhor a tela pequena.


## Ajustes desta versão

- Remove caret/barrinha piscando em áreas que não são campos.
- Foto de perfil maior e clicável.
- Modal da foto com opções: ver foto completa e fazer upload.
- Campo de bio salvo no Firebase.
- Bio limitada a 160 caracteres com emojis.


## Feed de posts

- Caixa “No que você está pensando?”
- Publicação com texto
- Publicação com imagem
- Emoji picker no post
- Posts salvos na coleção `posts` do Firestore
- Feed renderizado em tempo real
- Estrutura pronta para curtidas e comentários


## Layout social 3 colunas

- Coluna esquerda com perfil pequeno e menu social
- Feed principal no centro
- Coluna direita com:
  - espaço patrocinado
  - sugestões de amizade com botão +
  - aniversários próximos
  - contatos online/offline
- A antiga área grande de perfil saiu da tela principal


## Página de perfil

- Foto/nome do topo agora abre “Meu Perfil”
- Perfil com capa/banner estilo rede social
- Foto grande circular
- Bio exibida no perfil
- Abas visuais: Linha do tempo, Sobre, Amigos, Fotos
- Caixa para publicar no próprio perfil
- Posts do usuário aparecem na linha do tempo do perfil


## Correção desta versão

- Botão “Voltar ao início” agora volta para o feed principal.
- Logo 🐝 abelhaKut também volta para o feed principal.


## Correções antes de subir

- Botão de alterar capa fica visível por cima da capa.
- Botão “Voltar ao feed” mais claro.
- Textos de posts/comentários/bio podem ser selecionados e copiados.
- Botão Curtir funcionando em tempo real.
- Comentários funcionando em tempo real.
- Compartilhar copia o texto ou usa compartilhamento nativo quando disponível.


## Perfil público

- Agora dá para abrir perfil de outros usuários.
- Autor do post e comentários viram links para o perfil.
- Sugestões de amizade abrem o perfil da pessoa.
- Perfil público mostra capa, foto, bio, status e posts da pessoa.
- No perfil de outra pessoa aparece botão de mensagem ou adicionar.
- Botão de alterar capa foi movido para o topo direito para não ficar escondido.


## Correção

- Corrigido erro de JavaScript: `renderizarPaginaPerfil` declarado duas vezes.
- Adicionado favicon inline para evitar erro 404 de favicon.


## Correção final de duplicação

- Removidas funções duplicadas do sistema de perfil.
- JavaScript validado com `node --check`.


## Notificações e ações sociais

- Notificações persistentes para curtidas, comentários, compartilhamentos e marcações.
- Notificações ficam gravadas para ver depois.
- Clicar na notificação leva até a publicação.
- Menu ⋯ em cada publicação.
- Dono pode excluir a própria publicação.
- Usuário pode republicar post no próprio perfil.
- Comentários podem ser apagados pelo próprio autor.
- Editar bio dentro da página de perfil.
- Marcação com @amigo em posts e comentários.


## Correção de notificações sociais

- Curtidas criam notificação persistente para o dono do post.
- Comentários criam notificação persistente para o dono do post.
- Marcações com @ funcionam no post e nos comentários.
- Lista de amigos aparece ao digitar @.
- Clicar em notificação leva até a publicação correspondente.


## Correção de login

- Restaurada a função `carregarUsuariosSociais`.
- Login volta a carregar a página após autenticação.
- JavaScript validado com `node --check`.


## Modal de notificação

- Clicar em notificação abre a publicação em uma janela grande.
- Modal tem botão X para fechar.
- Abrir o sininho remove o número do badge, mas mantém histórico.
- Notificação só perde a bolinha vermelha quando for aberta/clicada.
- Comentários permanecem abertos depois de comentar.


## Correção `missing ) after argument list`

- Removidos onclicks dinâmicos perigosos de posts/comentários.
- Comentários agora usam event listeners reais.
- JavaScript validado com node --check.


## Correção definitiva de onclick dinâmico

- Removidos `onclick` dinâmicos com `${...}` de HTML gerado.
- Substituído por `data-*` e listener único seguro.
- Isso evita `missing ) after argument list` no navegador.
