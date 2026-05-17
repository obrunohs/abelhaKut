import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      sendPasswordResetEmail,
      sendEmailVerification,
      applyActionCode,
      signOut,
      onAuthStateChanged
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import {
      getFirestore,
      doc,
      setDoc,
      getDoc,
      updateDoc,
      collection,
      query,
      where,
      getDocs,
      addDoc,
      deleteDoc,
      serverTimestamp,
      arrayUnion,
      arrayRemove,
      onSnapshot
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

    // Configuração do Firebase do projeto abelhaKut
    const firebaseConfig = {
      apiKey: "AIzaSyCuNKXST-CCpDvlTtu3QX7FDgNxT5A7Kt0",
      authDomain: "abelhakut.firebaseapp.com",
      projectId: "abelhakut",
      storageBucket: "abelhakut.firebasestorage.app",
      messagingSenderId: "579128790046",
      appId: "1:579128790046:web:a60317ff1c1526fb80320f"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    let usuarioAtual = null;
    let dadosUsuario = null;
    let amigos = [];
    let paginaAtual = 0;
    let amigoChat = null;
    let chatIdAtual = null;
    let unsubscribeMessages = null;
    let unsubscribeTyping = null;
    let unsubscribeUsuario = null;
    let typingTimer = null;
    let ultimoUnreadChats = [];
    let abrindoChatAutomatico = false;
    let unsubscribeUsuariosOnline = null;
    let statusUsuarios = {};
    let primeiraLeituraStatusOnline = true;
    let primeiroSnapshotUsuario = true;
    let onlineHeartbeat = null;
    let chatMinimizado = false;

    const placeholderFoto = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='90' height='120'>
        <rect width='100%' height='100%' fill='#fff3b0'/>
        <text x='50%' y='48%' text-anchor='middle' font-size='30'>🐝</text>
        <text x='50%' y='70%' text-anchor='middle' font-size='14' fill='#9a6400'>Foto</text>
      </svg>
    `);

    const authScreen = document.getElementById("authScreen");
    const appScreen = document.getElementById("appScreen");
    const loginBox = document.getElementById("loginBox");
    const cadastroBox = document.getElementById("cadastroBox");
    const authStatus = document.getElementById("authStatus");

    const loginEmailInput = document.getElementById("loginEmailInput");
    const loginSenhaInput = document.getElementById("loginSenhaInput");
    const cadastroNomeInput = document.getElementById("cadastroNomeInput");
    const cadastroEmailInput = document.getElementById("cadastroEmailInput");
    const cadastroSenhaInput = document.getElementById("cadastroSenhaInput");
    const cadastroNascimentoInput = document.getElementById("cadastroNascimentoInput");
    const maior16Input = document.getElementById("maior16Input");

    const minhaFotoTopo = document.getElementById("minhaFotoTopo");
    const minhaFotoPerfil = document.getElementById("minhaFotoPerfil");
    const meuNome = document.getElementById("meuNome");
    const fotoStatus = document.getElementById("fotoStatus");

    const pesquisaTopo = document.getElementById("pesquisaTopo");
    const pesquisaAmigos = document.getElementById("pesquisaAmigos");
    const friendsGrid = document.getElementById("friendsGrid");
    const searchResults = document.getElementById("searchResults");
    const bellCount = document.getElementById("bellCount");
    const notificationsBox = document.getElementById("notificationsBox");
    const friendsDropdown = document.getElementById("friendsDropdown");
    const chatsDropdown = document.getElementById("chatsDropdown");
    const friendsTopCount = document.getElementById("friendsTopCount");
    const chatTopCount = document.getElementById("chatTopCount");
    const chatPanel = document.getElementById("chatPanel");
    const chatFoto = document.getElementById("chatFoto");
    const chatNome = document.getElementById("chatNome");
    const messages = document.getElementById("messages");
    const typingStatus = document.getElementById("typingStatus");
    const messageInput = document.getElementById("messageInput");
    const emojiPicker = document.getElementById("emojiPicker");
    const chatMinimizedBar = document.getElementById("chatMinimizedBar");
    const chatMinFoto = document.getElementById("chatMinFoto");
    const chatMinNome = document.getElementById("chatMinNome");
    const chatStatusLinha = document.getElementById("chatStatusLinha");
    const onlineToastContainer = document.getElementById("onlineToastContainer");

    function esperarComTempoLimite(promessa, segundos, mensagem) {
      return Promise.race([
        promessa,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(mensagem)), segundos * 1000);
        })
      ]);
    }

    window.mostrarCadastro = function () {
      loginBox.classList.add("hidden");
      cadastroBox.classList.remove("hidden");
      authStatus.textContent = "";
    };

    window.mostrarLogin = function () {
      cadastroBox.classList.add("hidden");
      loginBox.classList.remove("hidden");
      authStatus.textContent = "";
    };

    async function verificarLinkDeEmail() {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");

      if (mode === "verifyEmail" && oobCode) {
        try {
          await applyActionCode(auth, oobCode);
          mostrarLogin();
          authStatus.textContent = "Parabéns, você agora é um membro abelhaKut. Volte para a tela de login.";
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          authStatus.textContent = "Esse link de confirmação já foi usado ou expirou.";
        }
      }
    }

    verificarLinkDeEmail();

    window.login = async function () {
      const email = loginEmailInput.value.trim();
      const senha = loginSenhaInput.value.trim();

      if (!email || !senha) {
        authStatus.textContent = "Preencha o e-mail e a senha.";
        return;
      }

      authStatus.textContent = "Entrando...";

      try {
        const cred = await signInWithEmailAndPassword(auth, email, senha);
        await cred.user.reload();

        if (!cred.user.emailVerified) {
          await signOut(auth);
          authStatus.textContent = "Confirme seu email antes de entrar. Veja o link que enviamos para sua caixa de entrada.";
          return;
        }

        authStatus.textContent = "";
      } catch (error) {
        authStatus.textContent = "E-mail ou senha incorretos. Verifique os dados ou crie uma conta no abelhaKut.";
      }
    };

    window.cadastrar = async function () {
      const nome = cadastroNomeInput.value.trim();
      const email = cadastroEmailInput.value.trim();
      const senha = cadastroSenhaInput.value.trim();
      const nascimento = cadastroNascimentoInput.value;
      const maior16 = maior16Input.checked;
      const foto = placeholderFoto;

      if (!nome || !email || !senha || !nascimento) {
        authStatus.textContent = "Preencha nome, email, senha e data de nascimento.";
        return;
      }

      if (!maior16) {
        authStatus.textContent = "Para cadastrar, confirme que você é maior de 16 anos.";
        return;
      }

      if (senha.length < 6) {
        authStatus.textContent = "A senha precisa ter pelo menos 6 caracteres.";
        return;
      }

      authStatus.textContent = "Criando conta...";

      try {
        const cred = await esperarComTempoLimite(
          createUserWithEmailAndPassword(auth, email, senha),
          15,
          "O Firebase demorou para criar a conta. Confira sua internet e tente novamente."
        );

        authStatus.textContent = "Conta criada. Enviando link de confirmação...";

        await esperarComTempoLimite(
          sendEmailVerification(cred.user),
          15,
          "A conta foi criada, mas o envio do link demorou demais. Tente recuperar/reenviar depois."
        );

        authStatus.textContent = "Salvando seu perfil...";

        try {
          await esperarComTempoLimite(
            setDoc(doc(db, "users", cred.user.uid), {
              uid: cred.user.uid,
              nome,
              email,
              nascimento,
              maior16,
              foto,
              amigos: [],
              solicitacoesRecebidas: [],
              solicitacoesEnviadas: [],
              bloqueados: [],
              unreadChats: [],
              criadoEm: serverTimestamp()
            }),
            15,
            "O perfil demorou para salvar no banco de dados."
          );
        } catch (erroBanco) {
          console.error("Erro ao salvar perfil:", erroBanco);
        }

        await signOut(auth);
        mostrarLogin();
        authStatus.textContent =
          "Enviamos um link de confirmação para seu email. Clique no link para autenticar sua conta antes de entrar.";
      } catch (error) {
        console.error("Erro no cadastro:", error);

        if (error.code === "auth/email-already-in-use") {
          try {
            const loginExistente = await signInWithEmailAndPassword(auth, email, senha);
            await loginExistente.user.reload();

            if (!loginExistente.user.emailVerified) {
              await sendEmailVerification(loginExistente.user);

              await signOut(auth);
              mostrarLogin();
              authStatus.textContent =
                "Esse email já estava cadastrado, mas ainda não confirmado. Enviamos um novo link de confirmação para seu email.";
              return;
            }

            await signOut(auth);
            mostrarLogin();
            authStatus.textContent =
              "Este email já está cadastrado e confirmado. Entre usando seu email e senha.";
            return;
          } catch (erroLoginExistente) {
            authStatus.textContent =
              "Este email já está cadastrado no abelhaKut. Tente entrar ou recuperar sua senha.";
            return;
          }
        }

        if (error.code === "auth/invalid-email") {
          authStatus.textContent = "Digite um email válido.";
          return;
        }

        if (error.code === "auth/weak-password") {
          authStatus.textContent = "A senha precisa ter pelo menos 6 caracteres.";
          return;
        }

        if (error.code === "auth/network-request-failed") {
          authStatus.textContent = "Falha de internet. Verifique sua conexão e tente novamente.";
          return;
        }

        if (error.code === "auth/unauthorized-continue-uri" || String(error.message || "").includes("error-code:-26")) {
          authStatus.textContent =
            "O Firebase bloqueou a URL do link de confirmação. Agora o código usa o envio padrão. Apague a conta criada sem confirmação e tente cadastrar novamente.";
          return;
        }

        authStatus.textContent =
          "Não foi possível criar sua conta agora. Erro: " + (error.message || error);
      }
    };

    window.recuperarSenha = async function () {
      const email = loginEmailInput.value.trim() || cadastroEmailInput.value.trim();

      if (!email) {
        authStatus.textContent = "Digite seu email para recuperar a senha.";
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        authStatus.textContent = "Email de recuperação enviado.";
      } catch (error) {
        authStatus.textContent = "Erro: " + error.message;
      }
    };

    window.sair = async function () {
      await marcarUsuarioOffline();
      await signOut(auth);
    };

    window.atualizarFotoPerfil = async function (event) {
      const arquivo = event.target.files[0];
      if (!arquivo || !usuarioAtual) return;

      if (!arquivo.type.startsWith("image/")) {
        fotoStatus.textContent = "Escolha um arquivo de imagem.";
        return;
      }

      fotoStatus.textContent = "Carregando foto...";

      try {
        const fotoBase64 = await reduzirImagemParaBase64(arquivo);

        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          foto: fotoBase64
        });

        dadosUsuario.foto = fotoBase64;
        minhaFotoTopo.src = fotoBase64;
        minhaFotoPerfil.src = fotoBase64;
        fotoStatus.textContent = "Foto atualizada com sucesso!";
      } catch (error) {
        fotoStatus.textContent = "Erro ao atualizar foto: " + error.message;
      }
    };

    function reduzirImagemParaBase64(arquivo) {
      return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = () => {
          const img = new Image();

          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxLargura = 300;
            const maxAltura = 400;
            let largura = img.width;
            let altura = img.height;

            const proporcao = Math.min(maxLargura / largura, maxAltura / altura, 1);
            largura = Math.round(largura * proporcao);
            altura = Math.round(altura * proporcao);

            canvas.width = largura;
            canvas.height = altura;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, largura, altura);

            resolve(canvas.toDataURL("image/jpeg", 0.75));
          };

          img.onerror = reject;
          img.src = leitor.result;
        };

        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
      });
    }



    async function marcarUsuarioOnline() {
      if (!usuarioAtual) return;

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        online: true,
        lastSeen: serverTimestamp()
      }).catch(() => {});

      if (onlineHeartbeat) clearInterval(onlineHeartbeat);

      onlineHeartbeat = setInterval(() => {
        if (!usuarioAtual) return;

        updateDoc(doc(db, "users", usuarioAtual.uid), {
          online: true,
          lastSeen: serverTimestamp()
        }).catch(() => {});
      }, 30000);
    }

    async function marcarUsuarioOffline() {
      if (!usuarioAtual) return;

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }).catch(() => {});
    }

    window.addEventListener("beforeunload", () => {
      if (!usuarioAtual) return;

      updateDoc(doc(db, "users", usuarioAtual.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }).catch(() => {});
    });

    function ouvirStatusUsuarios() {
      if (!usuarioAtual) return;
      if (unsubscribeUsuariosOnline) unsubscribeUsuariosOnline();

      unsubscribeUsuariosOnline = onSnapshot(collection(db, "users"), (snap) => {
        snap.forEach((docSnap) => {
          const pessoa = docSnap.data();
          if (!pessoa?.uid || pessoa.uid === usuarioAtual.uid) return;

          const statusAnterior = statusUsuarios[pessoa.uid];
          const statusAtual = !!pessoa.online;
          const ehAmigo = (dadosUsuario?.amigos || []).includes(pessoa.uid);

          if (!primeiraLeituraStatusOnline && ehAmigo && statusAnterior !== undefined && statusAnterior !== statusAtual) {
            mostrarNotificacaoStatus(pessoa, statusAtual);
          }

          statusUsuarios[pessoa.uid] = statusAtual;
        });

        primeiraLeituraStatusOnline = false;

        if (dadosUsuario) {
          carregarAmigos();
        }

        atualizarStatusChat();
      });
    }

    function mostrarNotificacaoStatus(pessoa, online) {
      if (!onlineToastContainer) return;

      const toast = document.createElement("div");
      toast.className = "online-toast " + (online ? "online-toast" : "offline-toast");

      toast.innerHTML = `
        <img src="${pessoa.foto || placeholderFoto}" alt="Foto de ${pessoa.nome || "usuário"}" />
        <div>
          <strong>${pessoa.nome || "Alguém"}</strong>
          <small>${online ? "acabou de entrar no abelhaKut 🟢" : "saiu do abelhaKut ⚫"}</small>
        </div>
      `;

      onlineToastContainer.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 5400);
    }

    function obterStatusOnline(idPessoa) {
      return !!statusUsuarios[idPessoa];
    }

    function atualizarStatusChat() {
      if (!amigoChat || !chatStatusLinha) return;

      const online = obterStatusOnline(amigoChat.uid);

      chatStatusLinha.innerHTML = `
        <span class="status-dot ${online ? "online" : "offline"}"></span>
        ${online ? "Online agora" : "Offline"}
      `;
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();

        if (!user.emailVerified) {
          await signOut(auth);
          return;
        }

        usuarioAtual = user;
        await marcarUsuarioOnline();
        await carregarUsuario();
        ouvirStatusUsuarios();
        authScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
      } else {
        if (unsubscribeUsuario) {
          unsubscribeUsuario();
          unsubscribeUsuario = null;
        }
        if (unsubscribeUsuariosOnline) {
          unsubscribeUsuariosOnline();
          unsubscribeUsuariosOnline = null;
        }
        if (onlineHeartbeat) {
          clearInterval(onlineHeartbeat);
          onlineHeartbeat = null;
        }
        usuarioAtual = null;
        dadosUsuario = null;
        authScreen.classList.remove("hidden");
        appScreen.classList.add("hidden");
      }
    });

    async function carregarUsuario() {
      const ref = doc(db, "users", usuarioAtual.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.email.split("@")[0],
          email: usuarioAtual.email,
          foto: placeholderFoto,
          amigos: [],
          solicitacoesRecebidas: [],
          solicitacoesEnviadas: [],
          bloqueados: [],
          unreadChats: [],
          criadoEm: serverTimestamp()
        });
        dadosUsuario = {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.email.split("@")[0],
          email: usuarioAtual.email,
          foto: placeholderFoto,
          amigos: [],
          solicitacoesRecebidas: [],
          solicitacoesEnviadas: [],
          bloqueados: [],
          unreadChats: []
        };
      } else {
        dadosUsuario = snap.data();
      }
      meuNome.textContent = dadosUsuario.nome;
      minhaFotoTopo.src = dadosUsuario.foto || placeholderFoto;
      minhaFotoPerfil.src = dadosUsuario.foto || placeholderFoto;
      renderizarNotificacoes();
      ouvirMeuUsuario();
      await carregarAmigos();
    }

    function ouvirMeuUsuario() {
      if (!usuarioAtual) return;
      if (unsubscribeUsuario) unsubscribeUsuario();

      unsubscribeUsuario = onSnapshot(doc(db, "users", usuarioAtual.uid), async (snap) => {
        if (!snap.exists()) return;

        const unreadAntes = Array.isArray(ultimoUnreadChats) ? ultimoUnreadChats : [];

        dadosUsuario = snap.data();

        const unreadAgora = Array.isArray(dadosUsuario.unreadChats) ? dadosUsuario.unreadChats : [];
        const novosChats = unreadAgora.filter((chatId) => !unreadAntes.includes(chatId));

        renderizarNotificacoes();
        await carregarAmigos();

        // Na primeira leitura não abre chats antigos automaticamente.
        // Depois disso, qualquer novo chat não lido abre o chat se estiver fechado.
        if (!primeiroSnapshotUsuario && novosChats.length > 0) {
          const chatParaAbrir = novosChats[novosChats.length - 1];
          await abrirChatAutomaticamente(chatParaAbrir);
        }

        ultimoUnreadChats = [...unreadAgora];
        primeiroSnapshotUsuario = false;
      });
    }

    window.alternarNotificacoes = function () {
      notificationsBox.classList.toggle("hidden");
      if (friendsDropdown) friendsDropdown.classList.add("hidden");
      if (chatsDropdown) chatsDropdown.classList.add("hidden");
    };

    async function renderizarNotificacoes() {
      if (!dadosUsuario) return;

      const recebidas = dadosUsuario.solicitacoesRecebidas || [];
      const unreadChats = dadosUsuario.unreadChats || [];
      const total = recebidas.length + unreadChats.length;

      bellCount.textContent = total;
      bellCount.style.display = total > 0 ? "flex" : "none";
      if (chatTopCount) {
        chatTopCount.textContent = unreadChats.length;
        chatTopCount.style.display = unreadChats.length > 0 ? "flex" : "none";
      }
      if (friendsTopCount) {
        friendsTopCount.textContent = recebidas.length;
        friendsTopCount.style.display = recebidas.length > 0 ? "flex" : "none";
      }
      renderizarPainelConversas();
      renderizarPainelAmigos();
      notificationsBox.innerHTML = "";

      if (total === 0) {
        notificationsBox.innerHTML = "<p class='status'>Nenhuma notificação agora.</p>";
        return;
      }

      if (recebidas.length > 0) {
        const title = document.createElement("div");
        title.className = "notification-section-title";
        title.textContent = "Solicitações de amizade";
        notificationsBox.appendChild(title);
      }

      for (const id of recebidas) {
        const snap = await getDoc(doc(db, "users", id));
        if (!snap.exists()) continue;
        const pessoa = snap.data();
        const item = document.createElement("div");
        item.className = "notification-item";
        item.innerHTML = `
          <img src="${pessoa.foto || placeholderFoto}" />
          <div>
            <strong>${pessoa.nome}</strong><br />
            <small>enviou uma solicitação de amizade</small>
            <div class="notification-actions">
              <button onclick="aceitarSolicitacao('${pessoa.uid}')">Aceitar</button>
              <button class="deny-btn" onclick="negarSolicitacao('${pessoa.uid}')">Negar</button>
              <button class="block-btn" onclick="bloquearPessoa('${pessoa.uid}')">Bloquear</button>
            </div>
          </div>
        `;
        notificationsBox.appendChild(item);
      }

      if (unreadChats.length > 0) {
        const title = document.createElement("div");
        title.className = "notification-section-title";
        title.textContent = "Mensagens não lidas";
        notificationsBox.appendChild(title);
      }

      for (const chatId of unreadChats) {
        const outroId = chatId.split("_").find((id) => id !== usuarioAtual.uid);
        if (!outroId) continue;

        const snap = await getDoc(doc(db, "users", outroId));
        if (!snap.exists()) continue;
        const pessoa = snap.data();

        const item = document.createElement("div");
        item.className = "notification-item";
        item.innerHTML = `
          <img src="${pessoa.foto || placeholderFoto}" />
          <div>
            <strong>${pessoa.nome}</strong><br />
            <small>mandou uma nova mensagem</small>
            <div class="notification-actions">
              <button onclick="abrirChatPorId('${pessoa.uid}')">Abrir chat</button>
            </div>
          </div>
        `;
        notificationsBox.appendChild(item);
      }
    }

    async function carregarAmigos() {
      amigos = [];

      const idsOriginais = dadosUsuario.amigos || [];
      const ids = [...new Set(idsOriginais.filter(Boolean))];

      // Corrige automaticamente amizades duplicadas antigas no seu usuário.
      if (ids.length !== idsOriginais.length && usuarioAtual) {
        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          amigos: ids
        }).catch(() => {});
        dadosUsuario.amigos = ids;
      }

      for (const id of ids) {
        const amigoSnap = await getDoc(doc(db, "users", id));
        if (amigoSnap.exists()) {
          const dadosAmigo = amigoSnap.data();
          if (!amigos.some((p) => p.uid === dadosAmigo.uid)) {
            amigos.push(dadosAmigo);
          }
        }
      }

      renderizarAmigos();
    }

    function renderizarAmigos() {
      if (friendsTopCount) {
        const pedidosPendentes = (dadosUsuario?.solicitacoesRecebidas || []).length;
        friendsTopCount.textContent = pedidosPendentes;
        friendsTopCount.style.display = pedidosPendentes > 0 ? "flex" : "none";
      }

      renderizarPainelAmigos();
      renderizarPainelConversas();

      // Compatibilidade: se existir grade antiga, não quebra.
      if (!friendsGrid) return;

      friendsGrid.innerHTML = "";

      const inicio = paginaAtual * 12;
      const fim = inicio + 12;
      const amigosPagina = amigos.slice(inicio, fim);

      if (amigosPagina.length === 0) {
        friendsGrid.innerHTML = "<p>Você ainda não adicionou amigos.</p>";
        return;
      }

      amigosPagina.forEach((amigo) => {
        const card = document.createElement("div");
        card.className = "friend-card";

        const online = obterStatusOnline(amigo.uid);

        card.innerHTML = `
          <img src="${amigo.foto || placeholderFoto}" />
          <p>${amigo.nome}</p>
          <div class="friend-status-line">
            <span class="status-dot ${online ? "online" : "offline"}"></span>
            ${online ? "Online" : "Offline"}
          </div>
          <div class="friend-actions">
            <button onclick="abrirChatPorId('${amigo.uid}')">💬 Chat</button>
            <button class="remove-friend-btn" onclick="removerAmizade('${amigo.uid}')">Remover</button>
          </div>
        `;
        friendsGrid.appendChild(card);
      });
    }


    window.alternarPainelAmigos = function () {
      friendsDropdown.classList.toggle("hidden");
      chatsDropdown.classList.add("hidden");
      notificationsBox.classList.add("hidden");
      renderizarPainelAmigos();
    };

    window.fecharPainelAmigos = function () {
      friendsDropdown.classList.add("hidden");
    };

    window.alternarPainelConversas = function () {
      chatsDropdown.classList.toggle("hidden");
      friendsDropdown.classList.add("hidden");
      notificationsBox.classList.add("hidden");
      renderizarPainelConversas();
    };

    function renderizarPainelAmigos() {
      if (!friendsDropdown || !dadosUsuario) return;

      friendsDropdown.innerHTML = `
        <div class="dropdown-title">
          <h3>👥 Amigos (${amigos.length})</h3>
          <button class="dropdown-close-btn" onclick="fecharPainelAmigos()">Fechar</button>
        </div>
        <input id="friendsDropdownSearch" class="dropdown-search" placeholder="Buscar amigo..." oninput="filtrarAmigosDropdown()" />
        <div id="friendsDropdownList"></div>
      `;

      preencherListaAmigosDropdown(amigos);
    }

    window.filtrarAmigosDropdown = function () {
      const input = document.getElementById("friendsDropdownSearch");
      const texto = (input?.value || "").trim().toLowerCase();
      const filtrados = amigos.filter((amigo) => 
        amigo.nome?.toLowerCase().includes(texto) ||
        amigo.email?.toLowerCase().includes(texto)
      );
      preencherListaAmigosDropdown(filtrados);
    };

    function preencherListaAmigosDropdown(lista) {
      const list = document.getElementById("friendsDropdownList");
      if (!list) return;

      if (lista.length === 0) {
        list.innerHTML = "<p class='status'>Nenhum amigo encontrado.</p>";
        return;
      }

      list.innerHTML = "";

      lista.forEach((amigo) => {
        const online = obterStatusOnline(amigo.uid);
        const item = document.createElement("div");
        item.className = "friend-list-item";
        item.innerHTML = `
          <img src="${amigo.foto || placeholderFoto}" />
          <div>
            <strong>${amigo.nome}</strong>
            <small><span class="status-dot ${online ? "online" : "offline"}"></span>${online ? "Online" : "Offline"}</small>
          </div>
          <div class="friend-list-actions">
            <button onclick="abrirChatPorId('${amigo.uid}')">Chat</button>
            <button class="remove-friend-btn" onclick="removerAmizade('${amigo.uid}')">Remover</button>
          </div>
        `;
        list.appendChild(item);
      });
    }

    function renderizarPainelConversas() {
      if (!chatsDropdown || !dadosUsuario) return;

      const unreadChats = dadosUsuario.unreadChats || [];

      if (chatTopCount) {
        chatTopCount.textContent = unreadChats.length;
        chatTopCount.style.display = unreadChats.length > 0 ? "flex" : "none";
      }

      chatsDropdown.innerHTML = `
        <div class="dropdown-title">
          <h3>💬 Conversas</h3>
          <small>${unreadChats.length} não aberta(s)</small>
        </div>
        <div id="chatsDropdownList"></div>
      `;

      const list = document.getElementById("chatsDropdownList");
      if (!list) return;

      if (amigos.length === 0) {
        list.innerHTML = "<p class='status'>Você ainda não tem conversas. Adicione amigos para começar.</p>";
        return;
      }

      list.innerHTML = "";

      const ordenados = [...amigos].sort((a, b) => {
        const aUnread = unreadChats.includes(gerarChatId(usuarioAtual.uid, a.uid)) ? 1 : 0;
        const bUnread = unreadChats.includes(gerarChatId(usuarioAtual.uid, b.uid)) ? 1 : 0;
        return bUnread - aUnread || (a.nome || "").localeCompare(b.nome || "");
      });

      ordenados.forEach((amigo) => {
        const chatId = gerarChatId(usuarioAtual.uid, amigo.uid);
        const naoAberta = unreadChats.includes(chatId);
        const online = obterStatusOnline(amigo.uid);

        const item = document.createElement("div");
        item.className = "chat-list-item " + (naoAberta ? "unread" : "");
        item.onclick = () => abrirChatPorId(amigo.uid);
        item.innerHTML = `
          <img src="${amigo.foto || placeholderFoto}" />
          <div>
            <strong>${amigo.nome}</strong>
            <small><span class="status-dot ${online ? "online" : "offline"}"></span>${online ? "Online" : "Offline"} • ${naoAberta ? "mensagem não aberta" : "abrir conversa"}</small>
          </div>
          <span class="chat-unread-pill">1</span>
        `;
        list.appendChild(item);
      });
    }

    window.proximaPagina = function () {
      if ((paginaAtual + 1) * 12 < amigos.length) {
        paginaAtual++;
        renderizarAmigos();
      }
    };

    window.paginaAnterior = function () {
      if (paginaAtual > 0) {
        paginaAtual--;
        renderizarAmigos();
      }
    };

    window.sincronizarPesquisaTopo = function () {
      if (pesquisaAmigos) pesquisaAmigos.value = pesquisaTopo.value;
      pesquisarUsuarios();
    };

    window.pesquisarUsuarios = async function () {
      const texto = (pesquisaAmigos?.value || pesquisaTopo?.value || "").trim().toLowerCase();
      if (searchResults) searchResults.innerHTML = "";

      if (texto.length < 2) return;

      const usersRef = collection(db, "users");
      const snap = await getDocs(usersRef);

      snap.forEach((docSnap) => {
        const user = docSnap.data();
        const jaSouEu = user.uid === usuarioAtual.uid;
        const jaEhAmigo = (dadosUsuario.amigos || []).includes(user.uid);
        const jaEnviei = (dadosUsuario.solicitacoesEnviadas || []).includes(user.uid);
        const bloqueei = (dadosUsuario.bloqueados || []).includes(user.uid);
        const meBloqueou = (user.bloqueados || []).includes(usuarioAtual.uid);
        const bateNome = user.nome?.toLowerCase().includes(texto);
        const bateEmail = user.email?.toLowerCase().includes(texto);

        if (!jaSouEu && !jaEhAmigo && !jaEnviei && !bloqueei && !meBloqueou && (bateNome || bateEmail)) {
          const item = document.createElement("div");
          item.className = "result-item";
          item.innerHTML = `
            <img src="${user.foto || placeholderFoto}" />
            <div>
              <strong>${user.nome}</strong><br />
              <small>${user.email}</small>
            </div>
            <button>Enviar convite</button>
          `;
          item.querySelector("button").onclick = () => enviarSolicitacao(user.uid);
          const destino = searchResults || friendsDropdown;
          if (destino) {
            if (!searchResults && destino.classList.contains("hidden")) destino.classList.remove("hidden");
            destino.appendChild(item);
          }
        }
      });
    };

    async function enviarSolicitacao(idPessoa) {
      if (!usuarioAtual || !idPessoa) return;

      try {
        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          solicitacoesEnviadas: arrayUnion(idPessoa)
        });

        await updateDoc(doc(db, "users", idPessoa), {
          solicitacoesRecebidas: arrayUnion(usuarioAtual.uid)
        });

        authStatus.textContent = "Solicitação de amizade enviada.";
        await carregarUsuario();
        await pesquisarUsuarios();
      } catch (error) {
        alert("Não foi possível enviar o convite: " + error.message);
      }
    }

    window.aceitarSolicitacao = async function (idPessoa) {
      if (!usuarioAtual || !idPessoa) return;

      const meusAmigos = [...new Set(dadosUsuario.amigos || [])];

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        amigos: meusAmigos.includes(idPessoa) ? meusAmigos : [...meusAmigos, idPessoa],
        solicitacoesRecebidas: arrayRemove(idPessoa)
      });

      await updateDoc(doc(db, "users", idPessoa), {
        amigos: arrayUnion(usuarioAtual.uid),
        solicitacoesEnviadas: arrayRemove(usuarioAtual.uid)
      });

      notificationsBox.classList.add("hidden");
      await carregarUsuario();
    };

    window.negarSolicitacao = async function (idPessoa) {
      if (!usuarioAtual || !idPessoa) return;

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        solicitacoesRecebidas: arrayRemove(idPessoa)
      });

      await updateDoc(doc(db, "users", idPessoa), {
        solicitacoesEnviadas: arrayRemove(usuarioAtual.uid)
      });

      await carregarUsuario();
    };

    window.bloquearPessoa = async function (idPessoa) {
      if (!usuarioAtual || !idPessoa) return;

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        bloqueados: arrayUnion(idPessoa),
        amigos: arrayRemove(idPessoa),
        solicitacoesRecebidas: arrayRemove(idPessoa),
        solicitacoesEnviadas: arrayRemove(idPessoa)
      });

      await updateDoc(doc(db, "users", idPessoa), {
        amigos: arrayRemove(usuarioAtual.uid),
        solicitacoesRecebidas: arrayRemove(usuarioAtual.uid),
        solicitacoesEnviadas: arrayRemove(usuarioAtual.uid)
      });

      await carregarUsuario();
    };

    window.removerAmizade = async function (idPessoa) {
      if (!usuarioAtual || !idPessoa) return;

      const amigo = amigos.find((p) => p.uid === idPessoa);
      const nome = amigo?.nome || "esse amigo";
      const confirmar = confirm(`Remover ${nome} da sua lista de amigos?`);
      if (!confirmar) return;

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        amigos: arrayRemove(idPessoa)
      });

      await updateDoc(doc(db, "users", idPessoa), {
        amigos: arrayRemove(usuarioAtual.uid)
      });

      if (amigoChat?.uid === idPessoa) {
        fecharChat();
      }

      await carregarUsuario();
    };

    window.abrirChatPorId = async function (idPessoa) {
      let amigo = amigos.find((p) => p.uid === idPessoa);

      if (!amigo) {
        const snap = await getDoc(doc(db, "users", idPessoa));
        if (snap.exists()) amigo = snap.data();
      }

      if (amigo) abrirChat(amigo);
    };

    async function abrirChatAutomaticamente(chatId) {
      if (!usuarioAtual || abrindoChatAutomatico) return;

      const chatEstaAberto = !chatPanel.classList.contains("hidden");

      // Se o mesmo chat já estiver aberto, não precisa abrir de novo.
      if (chatIdAtual === chatId && chatEstaAberto) return;

      const outroId = chatId.split("_").find((id) => id !== usuarioAtual.uid);
      if (!outroId) return;

      abrindoChatAutomatico = true;

      try {
        let amigo = amigos.find((p) => p.uid === outroId);

        if (!amigo) {
          const snap = await getDoc(doc(db, "users", outroId));
          if (snap.exists()) amigo = snap.data();
        }

        if (amigo) {
          await abrirChat(amigo);
          chatPanel.classList.add("chat-attention");
          setTimeout(() => chatPanel.classList.remove("chat-attention"), 900);
        }
      } finally {
        abrindoChatAutomatico = false;
      }
    }

    window.fecharChat = function () {
      chatPanel.classList.add("hidden");
      if (chatMinimizedBar) chatMinimizedBar.classList.add("hidden");
      chatMinimizado = false;
      messages.innerHTML = "";
      typingStatus.textContent = "";
      if (emojiPicker) emojiPicker.classList.add("hidden");
      if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
      }
      if (unsubscribeTyping) {
        unsubscribeTyping();
        unsubscribeTyping = null;
      }
      amigoChat = null;
      chatIdAtual = null;
    };


    window.minimizarChat = function () {
      if (!amigoChat) return;

      chatPanel.classList.add("hidden");
      if (chatMinFoto) chatMinFoto.src = amigoChat.foto || placeholderFoto;
      if (chatMinNome) chatMinNome.textContent = amigoChat.nome;
      if (chatMinimizedBar) chatMinimizedBar.classList.remove("hidden");
      chatMinimizado = true;
    };

    window.restaurarChat = function () {
      if (!amigoChat) return;

      chatPanel.classList.remove("hidden");
      if (chatMinimizedBar) chatMinimizedBar.classList.add("hidden");
      chatMinimizado = false;
      messages.scrollTop = messages.scrollHeight;
    };

    function gerarChatId(id1, id2) {
      return [id1, id2].sort().join("_");
    }

    window.abrirChat = async function (amigo) {
      amigoChat = amigo;
      chatIdAtual = gerarChatId(usuarioAtual.uid, amigo.uid);

      chatPanel.classList.remove("hidden");
      if (chatMinimizedBar) chatMinimizedBar.classList.add("hidden");
      chatMinimizado = false;
      notificationsBox.classList.add("hidden");
      if (friendsDropdown) friendsDropdown.classList.add("hidden");
      if (chatsDropdown) chatsDropdown.classList.add("hidden");
      chatFoto.src = amigo.foto || placeholderFoto;
      chatNome.textContent = amigo.nome;
      if (chatMinFoto) chatMinFoto.src = amigo.foto || placeholderFoto;
      if (chatMinNome) chatMinNome.textContent = amigo.nome;
      atualizarStatusChat();
      messages.innerHTML = "";

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        unreadChats: arrayRemove(chatIdAtual)
      }).catch(() => {});

      await setDoc(doc(db, "chats", chatIdAtual), {
        participantes: [usuarioAtual.uid, amigo.uid]
      }, { merge: true });

      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeTyping) unsubscribeTyping();

      const mensagensRef = collection(db, "messages");

      // Consulta simples para não depender de índice composto do Firestore.
      // A organização por horário é feita aqui no navegador.
      const q = query(
        mensagensRef,
        where("chatId", "==", chatIdAtual)
      );

      unsubscribeMessages = onSnapshot(q, (snap) => {
        messages.innerHTML = "";

        const listaMensagens = [];

        snap.forEach((docSnap) => {
          listaMensagens.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });

        listaMensagens.sort((a, b) => {
          const tempoA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tempoB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tempoA - tempoB;
        });

        listaMensagens.forEach((msg) => {
          const minha = msg.senderId === usuarioAtual.uid;

          const row = document.createElement("div");
          row.className = "message-row " + (minha ? "mine-row" : "theirs-row");

          const avatar = document.createElement("img");
          avatar.className = "msg-avatar";
          avatar.alt = minha ? "Minha foto" : "Foto do amigo";
          avatar.src = minha
            ? (dadosUsuario.foto || placeholderFoto)
            : (amigoChat.foto || placeholderFoto);

          const div = document.createElement("div");
          div.className = "message " + (minha ? "mine" : "theirs");

          const tempo = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
          const podeApagar = minha && Date.now() - tempo.getTime() <= 7000;

          div.innerHTML = `
            <div>${msg.texto}</div>
            <small>${tempo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small>
            ${podeApagar ? `<button class="delete-msg">Apagar</button>` : ""}
          `;

          const botao = div.querySelector("button");
          if (botao) botao.onclick = () => apagarMensagem(msg.id, tempo);

          if (minha) {
            row.appendChild(div);
            row.appendChild(avatar);
          } else {
            row.appendChild(avatar);
            row.appendChild(div);
          }

          messages.appendChild(row);
        });

        messages.scrollTop = messages.scrollHeight;
      }, (error) => {
        messages.innerHTML = `<p style="color:red; padding:10px;">Erro ao carregar mensagens: ${error.message}</p>`;
      });

      unsubscribeTyping = onSnapshot(doc(db, "chats", chatIdAtual), (snap) => {
        const data = snap.data();
        const digitando = data?.digitando?.[amigo.uid];
        typingStatus.textContent = digitando ? `${amigo.nome} está digitando...` : "";
      });
    };

    window.alternarEmojiPicker = function () {
      emojiPicker.classList.toggle("hidden");
    };

    window.adicionarEmoji = function (emoji) {
      messageInput.value += emoji;
      messageInput.focus();
      marcarDigitando();
    };

    window.enviarMensagem = async function () {
      const texto = messageInput.value.trim();

      if (!texto) return;

      if (!chatIdAtual || !amigoChat || !usuarioAtual) {
        alert("Abra o chat de um amigo antes de enviar mensagem.");
        return;
      }

      try {
        const textoOriginal = texto;
        messageInput.value = "";

        await addDoc(collection(db, "messages"), {
          chatId: chatIdAtual,
          senderId: usuarioAtual.uid,
          receiverId: amigoChat.uid,
          texto: textoOriginal,
          createdAt: serverTimestamp()
        });

        // Marca a conversa como não lida para quem recebeu a mensagem.
        await updateDoc(doc(db, "users", amigoChat.uid), {
          unreadChats: arrayUnion(chatIdAtual)
        }).catch(() => {});

        emojiPicker.classList.add("hidden");
        await pararDigitando();
      } catch (error) {
        messageInput.value = texto;
        alert("Não foi possível enviar a mensagem: " + error.message);
      }
    };

    async function apagarMensagem(messageId, tempo) {
      if (Date.now() - tempo.getTime() > 7000) {
        alert("Só é possível apagar a mensagem em até 7 segundos.");
        return;
      }

      await deleteDoc(doc(db, "messages", messageId));
    }

    window.marcarDigitando = async function () {
      if (!chatIdAtual || !usuarioAtual) return;

      await setDoc(doc(db, "chats", chatIdAtual), {
        digitando: {
          [usuarioAtual.uid]: true
        }
      }, { merge: true });

      clearTimeout(typingTimer);
      typingTimer = setTimeout(pararDigitando, 1200);
    };

    async function pararDigitando() {
      if (!chatIdAtual || !usuarioAtual) return;

      await setDoc(doc(db, "chats", chatIdAtual), {
        digitando: {
          [usuarioAtual.uid]: false
        }
      }, { merge: true });
    }
