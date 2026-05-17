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
    let todosUsuarios = [];
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
    let imagemPostBase64 = "";
    let imagemProfilePostBase64 = "";
    let unsubscribePosts = null;
    let postsCache = [];
    let notificacoesCache = [];
    let unsubscribeNotificacoes = null;
    let postFocoId = null;
    let perfilAbertoUid = null;
    let perfilAbertoDados = null;
    let statusInicialCarregado = false;
    let statusMudancasPendentes = {};

    const placeholderFoto = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='90' height='120'>
        <rect width='100%' height='100%' fill='#fff3b0'/>
        <text x='50%' y='48%' text-anchor='middle' font-size='30'>🐝</text>
        <text x='50%' y='70%' text-anchor='middle' font-size='14' fill='#9a6400'>Foto</text>
      </svg>
    `);

    const placeholderCapa = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='360'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='#fff3b0'/>
            <stop offset='55%' stop-color='#ffd166'/>
            <stop offset='100%' stop-color='#f7a800'/>
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' fill='url(#g)'/>
        <text x='50%' y='48%' text-anchor='middle' font-size='82'>🐝</text>
        <text x='50%' y='70%' text-anchor='middle' font-size='28' fill='#8a5a00'>abelhaKut</text>
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
    const meuNomePerfil = document.getElementById("meuNomePerfil");
    const fotoStatus = document.getElementById("fotoStatus");
    const fotoPerfilModal = document.getElementById("fotoPerfilModal");
    const fotoPerfilModalImg = document.getElementById("fotoPerfilModalImg");
    const bioInput = document.getElementById("bioInput");
    const bioCount = document.getElementById("bioCount");
    const bioStatus = document.getElementById("bioStatus");
    const postMinhaFoto = document.getElementById("postMinhaFoto");
    const postTextoInput = document.getElementById("postTextoInput");
    const postImagemInput = document.getElementById("postImagemInput");
    const postPreviewBox = document.getElementById("postPreviewBox");
    const postPreviewImg = document.getElementById("postPreviewImg");
    const postEmojiPicker = document.getElementById("postEmojiPicker");
    const postStatus = document.getElementById("postStatus");
    const feedPosts = document.getElementById("feedPosts");
    const profilePage = document.getElementById("profilePage");
    const profileCoverImg = document.getElementById("profileCoverImg");
    const coverArquivo = document.getElementById("coverArquivo");
    const profileLargePhoto = document.getElementById("profileLargePhoto");
    const profilePageName = document.getElementById("profilePageName");
    const profilePageBio = document.getElementById("profilePageBio");
    const profileAboutBio = document.getElementById("profileAboutBio");
    const profilePostMinhaFoto = document.getElementById("profilePostMinhaFoto");
    const profilePostTextoInput = document.getElementById("profilePostTextoInput");
    const profilePostImagemInput = document.getElementById("profilePostImagemInput");
    const profilePostPreviewBox = document.getElementById("profilePostPreviewBox");
    const profilePostPreviewImg = document.getElementById("profilePostPreviewImg");
    const profilePostStatus = document.getElementById("profilePostStatus");
    const profilePosts = document.getElementById("profilePosts");
    const profileActionButtons = document.getElementById("profileActionButtons");
    const profileBioEditor = document.getElementById("profileBioEditor");
    const profileBioEditInput = document.getElementById("profileBioEditInput");
    const profileBioEditCount = document.getElementById("profileBioEditCount");
    const editProfileBioBtn = document.getElementById("editProfileBioBtn");
    const miniBioTexto = document.getElementById("miniBioTexto");
    const suggestionsList = document.getElementById("suggestionsList");
    const suggestionsCount = document.getElementById("suggestionsCount");
    const birthdaysList = document.getElementById("birthdaysList");
    const contactsList = document.getElementById("contactsList");
    const contactsCount = document.getElementById("contactsCount");

    const pesquisaTopo = document.getElementById("pesquisaTopo");
    const pesquisaAmigos = document.getElementById("pesquisaAmigos");
    const friendsGrid = document.getElementById("friendsGrid");
    const searchResults = document.getElementById("searchResults");
    const bellCount = document.getElementById("bellCount");
    const notificationsBox = document.getElementById("notificationsBox");
    const friendsDropdown = document.getElementById("friendsDropdown");
    const chatsDropdown = document.getElementById("chatsDropdown");
    const friendsTopCount = null;
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

    function limparCamposAuth() {
      loginEmailInput.value = "";
      loginSenhaInput.value = "";
      cadastroNomeInput.value = "";
      cadastroEmailInput.value = "";
      cadastroSenhaInput.value = "";
      cadastroNascimentoInput.value = "";
      maior16Input.checked = false;
    }

    window.mostrarCadastro = function () {
      loginEmailInput.value = "";
      loginSenhaInput.value = "";
      cadastroNomeInput.value = "";
      cadastroEmailInput.value = "";
      cadastroSenhaInput.value = "";
      cadastroNascimentoInput.value = "";
      maior16Input.checked = false;

      loginBox.classList.add("hidden");
      cadastroBox.classList.remove("hidden");
      authStatus.textContent = "";
    };

    window.mostrarLogin = function () {
      loginEmailInput.value = "";
      loginSenhaInput.value = "";
      cadastroNomeInput.value = "";
      cadastroEmailInput.value = "";
      cadastroSenhaInput.value = "";
      cadastroNascimentoInput.value = "";
      maior16Input.checked = false;

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
              bio: "",
              capa: placeholderCapa,
              amigos: [],
              solicitacoesRecebidas: [],
              solicitacoesEnviadas: [],
              bloqueados: [],
              unreadChats: [],
          conversasOcultas: [],
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
      limparCamposAuth();

      // Garante que o navegador não mantenha os dados visíveis na tela de login.
      setTimeout(limparCamposAuth, 100);
    };


    window.mostrarEditorBioPerfil = function () {
      if (!perfilAbertoDados || perfilAbertoDados.uid !== usuarioAtual.uid) return;

      profileBioEditInput.value = dadosUsuario.bio || "";
      profileBioEditCount.textContent = profileBioEditInput.value.length;
      profileBioEditor.classList.remove("hidden");
      if (editProfileBioBtn) editProfileBioBtn.classList.add("hidden");
    };

    window.cancelarBioPerfil = function () {
      profileBioEditor.classList.add("hidden");
      if (editProfileBioBtn) editProfileBioBtn.classList.remove("hidden");
    };

    window.salvarBioPerfil = async function () {
      if (!usuarioAtual || !profileBioEditInput) return;

      const bio = profileBioEditInput.value.trim();

      if (bio.length > 160) {
        alert("A bio pode ter no máximo 160 caracteres.");
        return;
      }

      try {
        await updateDoc(doc(db, "users", usuarioAtual.uid), { bio });

        dadosUsuario.bio = bio;
        if (bioInput) bioInput.value = bio;
        if (miniBioTexto) miniBioTexto.textContent = bio || "Clique para ver sua foto";
        if (profilePageBio) profilePageBio.textContent = bio || "Sem bio ainda.";
        if (profileAboutBio) profileAboutBio.textContent = bio || "Bio ainda não preenchida.";
        cancelarBioPerfil();
      } catch (error) {
        alert("Erro ao salvar bio: " + error.message);
      }
    };

    window.abrirMeuPerfil = function () {
      abrirPerfilUsuario(usuarioAtual.uid);
    };
window.atualizarCapaPerfil = async function (event) {
      const arquivo = event.target.files[0];
      if (!arquivo || !usuarioAtual) return;

      if (!arquivo.type.startsWith("image/")) {
        alert("Escolha uma imagem para a capa.");
        return;
      }

      try {
        const capaBase64 = await reduzirImagemParaBase64(arquivo);

        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          capa: capaBase64
        });

        dadosUsuario.capa = capaBase64;
        profileCoverImg.src = capaBase64;
      } catch (error) {
        alert("Erro ao atualizar capa: " + error.message);
      }
    };

    window.selecionarImagemProfilePost = async function (event) {
      const arquivo = event.target.files[0];
      if (!arquivo) return;

      if (!arquivo.type.startsWith("image/")) {
        profilePostStatus.textContent = "Escolha um arquivo de imagem.";
        return;
      }

      profilePostStatus.textContent = "Preparando imagem...";

      try {
        imagemProfilePostBase64 = await reduzirImagemParaBase64(arquivo);
        profilePostPreviewImg.src = imagemProfilePostBase64;
        profilePostPreviewBox.classList.remove("hidden");
        profilePostStatus.textContent = "";
      } catch (error) {
        profilePostStatus.textContent = "Erro ao carregar imagem: " + error.message;
      }
    };

    window.removerImagemProfilePost = function () {
      imagemProfilePostBase64 = "";
      profilePostPreviewImg.src = "";
      profilePostPreviewBox.classList.add("hidden");
      profilePostImagemInput.value = "";
    };

    window.adicionarEmojiProfilePost = function (emoji) {
      profilePostTextoInput.value += emoji;
      profilePostTextoInput.focus();
    };

    window.publicarProfilePost = async function () {
      if (!usuarioAtual || !dadosUsuario) return;

      const texto = profilePostTextoInput.value.trim();

      if (!texto && !imagemProfilePostBase64) {
        profilePostStatus.textContent = "Escreva algo ou escolha uma imagem para publicar.";
        return;
      }

      profilePostStatus.textContent = "Publicando no perfil...";

      try {
        const mencoes = extrairMencoesDoTexto(texto);

        const postRef = await addDoc(collection(db, "posts"), {
          autorId: usuarioAtual.uid,
          autorNome: dadosUsuario.nome || usuarioAtual.email,
          autorFoto: dadosUsuario.foto || placeholderFoto,
          texto,
          imagem: imagemProfilePostBase64 || "",
          curtidas: [],
          comentarios: [],
          mencionados: mencoes.map((p) => p.uid),
          createdAt: serverTimestamp(),
          destinoPerfilId: usuarioAtual.uid
        });

        const postCriado = {
          id: postRef.id,
          autorId: usuarioAtual.uid,
          texto
        };

        for (const pessoa of mencoes) {
          await criarNotificacaoPara(pessoa.uid, "mention", postCriado, "marcou você usando @" + pessoa.nome);
        }

        profilePostTextoInput.value = "";
        removerImagemProfilePost();
        profilePostStatus.textContent = "Publicado no perfil!";
      } catch (error) {
        profilePostStatus.textContent = "Erro ao publicar: " + error.message;
      }
    };

    window.alternarEmojiPost = function () {
      postEmojiPicker.classList.toggle("hidden");
    };

    window.adicionarEmojiPost = function (emoji) {
      postTextoInput.value += emoji;
      postTextoInput.focus();
    };

    window.selecionarImagemPost = async function (event) {
      const arquivo = event.target.files[0];
      if (!arquivo) return;

      if (!arquivo.type.startsWith("image/")) {
        postStatus.textContent = "Escolha um arquivo de imagem.";
        return;
      }

      postStatus.textContent = "Preparando imagem...";

      try {
        imagemPostBase64 = await reduzirImagemParaBase64(arquivo);
        postPreviewImg.src = imagemPostBase64;
        postPreviewBox.classList.remove("hidden");
        postStatus.textContent = "";
      } catch (error) {
        postStatus.textContent = "Erro ao carregar imagem: " + error.message;
      }
    };

    window.removerImagemPost = function () {
      imagemPostBase64 = "";
      postPreviewImg.src = "";
      postPreviewBox.classList.add("hidden");
      postImagemInput.value = "";
    };





    function extrairMencoesDoTexto(texto) {
      const encontrados = [];
      const textoLower = (texto || "").toLowerCase();

      amigos.forEach((amigo) => {
        const nome = (amigo.nome || "").trim();
        if (!nome) return;

        if (textoLower.includes("@" + nome.toLowerCase())) {
          if (!encontrados.some((p) => p.uid === amigo.uid)) {
            encontrados.push(amigo);
          }
        }
      });

      return encontrados;
    }

    function configurarMencoesTextarea(textarea) {
      if (!textarea || textarea.dataset.mentionsReady) return;
      textarea.dataset.mentionsReady = "1";

      const box = document.createElement("div");
      box.className = "mention-suggestions-fixed hidden";
      textarea.insertAdjacentElement("afterend", box);

      function atualizarSugestoes() {
        const valor = textarea.value;
        const cursor = textarea.selectionStart || valor.length;
        const antes = valor.slice(0, cursor);
        const match = antes.match(/@([^\n@]{0,40})$/);

        if (!match) {
          box.classList.add("hidden");
          return;
        }

        const termo = match[1].trim().toLowerCase();

        const lista = amigos
          .filter((amigo) => (amigo.nome || "").toLowerCase().includes(termo))
          .slice(0, 6);

        if (lista.length === 0) {
          box.classList.add("hidden");
          return;
        }

        box.innerHTML = "";

        lista.forEach((amigo) => {
          const item = document.createElement("div");
          item.className = "mention-item";
          item.innerHTML = `
            <img src="${amigo.foto || placeholderFoto}" />
            <strong>${amigo.nome}</strong>
          `;

          item.onclick = () => {
            const inicio = antes.lastIndexOf("@");
            textarea.value = valor.slice(0, inicio) + "@" + amigo.nome + " " + valor.slice(cursor);
            textarea.focus();
            box.classList.add("hidden");
          };

          box.appendChild(item);
        });

        box.classList.remove("hidden");
      }

      textarea.addEventListener("input", atualizarSugestoes);
      textarea.addEventListener("keyup", atualizarSugestoes);
      textarea.addEventListener("click", atualizarSugestoes);
      textarea.addEventListener("blur", () => {
        setTimeout(() => box.classList.add("hidden"), 220);
      });
    }


    window.publicarPost = async function () {
      if (!usuarioAtual || !dadosUsuario) return;

      const texto = postTextoInput.value.trim();

      if (!texto && !imagemPostBase64) {
        postStatus.textContent = "Escreva algo ou escolha uma imagem para publicar.";
        return;
      }

      postStatus.textContent = "Publicando...";

      try {
        const mencoes = extrairMencoesDoTexto(texto);

        const postRef = await addDoc(collection(db, "posts"), {
          autorId: usuarioAtual.uid,
          autorNome: dadosUsuario.nome || usuarioAtual.email,
          autorFoto: dadosUsuario.foto || placeholderFoto,
          texto,
          imagem: imagemPostBase64 || "",
          curtidas: [],
          comentarios: [],
          mencionados: mencoes.map((p) => p.uid),
          createdAt: serverTimestamp()
        });

        const postCriado = {
          id: postRef.id,
          autorId: usuarioAtual.uid,
          texto
        };

        for (const pessoa of mencoes) {
          await criarNotificacaoPara(pessoa.uid, "mention", postCriado, "marcou você usando @" + pessoa.nome);
        }

        postTextoInput.value = "";
        removerImagemPost();
        postEmojiPicker.classList.add("hidden");
        postStatus.textContent = "Publicado com sucesso!";
      } catch (error) {
        postStatus.textContent = "Erro ao publicar: " + error.message;
      }
    };

    function ouvirPosts() {
      if (unsubscribePosts) unsubscribePosts();

      unsubscribePosts = onSnapshot(collection(db, "posts"), (snap) => {
        const posts = [];

        snap.forEach((docSnap) => {
          posts.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });

        posts.sort((a, b) => {
          const tempoA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tempoB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tempoB - tempoA;
        });

        postsCache = posts;
        renderizarPosts(posts);
        renderizarProfilePosts();
      }, (error) => {
        feedPosts.innerHTML = `<div class="panel"><p class="status">Erro ao carregar feed: ${error.message}</p></div>`;
      });
    }

    function renderizarProfilePosts() {
      if (!profilePosts || !usuarioAtual) return;

      const uidPerfil = perfilAbertoUid || usuarioAtual.uid;
      const meusPosts = postsCache.filter((post) => post.autorId === uidPerfil);
      profilePosts.innerHTML = "";

      if (meusPosts.length === 0) {
        profilePosts.innerHTML = `
          <div class="panel feed-empty">
            <div class="feed-icon">🐝</div>
            <h2>Nenhuma publicação neste perfil</h2>
            <p>As publicações dessa pessoa aparecerão aqui.</p>
          </div>
        `;
        return;
      }

      meusPosts.forEach((post) => {
        const card = criarCardPost(post);
        profilePosts.appendChild(card);
      });
    }

    function renderizarComentariosLista(container, comentarios, postId) {
      if (!container) return;

      container.innerHTML = "";

      if (!comentarios || comentarios.length === 0) {
        container.innerHTML = "<p class='muted-text'>Nenhum comentário ainda.</p>";
        return;
      }

      comentarios.forEach((comentario) => {
        const item = document.createElement("div");
        item.className = "comment-item";

        const podeApagar = comentario.uid === usuarioAtual.uid;

        item.innerHTML = `
          <img onclick="abrirPerfilUsuario('${comentario.uid}')" src="${comentario.foto || placeholderFoto}" alt="Foto de ${comentario.nome || "usuário"}" />
          <div class="comment-bubble clickable-author">
            <strong class="comment-author" onclick="abrirPerfilUsuario('${comentario.uid}')">${comentario.nome || "Usuário"}</strong>
            <div class="comment-text">${comentario.texto || ""}</div>
            ${podeApagar ? `<button class="comment-delete-btn">Excluir comentário</button>` : ""}
          </div>
        `;

        const deleteBtn = item.querySelector(".comment-delete-btn");
        if (deleteBtn) {
          deleteBtn.onclick = (event) => {
            event.stopPropagation();
            excluirMeuComentario(postId, comentario);
          };
        }

        container.appendChild(item);
      });
    }

    async function alternarCurtidaPost(postId, curtidasAtuais, post) {
      if (!usuarioAtual || !postId) return;

      const jaCurti = (curtidasAtuais || []).includes(usuarioAtual.uid);

      try {
        await updateDoc(doc(db, "posts", postId), {
          curtidas: jaCurti ? arrayRemove(usuarioAtual.uid) : arrayUnion(usuarioAtual.uid)
        });

        if (!jaCurti) {
          await criarNotificacaoPara(post.autorId, "like", post, "curtiu sua publicação");
        }
      } catch (error) {
        alert("Não foi possível curtir agora: " + error.message);
      }
    }

    async function enviarComentarioPost(postId, input, post) {
      if (!usuarioAtual || !dadosUsuario || !postId || !input) return;

      const texto = input.value.trim();
      if (!texto) return;

      const comentario = {
        id: gerarIdSimples(),
        uid: usuarioAtual.uid,
        nome: dadosUsuario.nome || usuarioAtual.email,
        foto: dadosUsuario.foto || placeholderFoto,
        texto,
        criadoEm: Date.now()
      };

      try {
        await updateDoc(doc(db, "posts", postId), {
          comentarios: arrayUnion(comentario)
        });

        await criarNotificacaoPara(post.autorId, "comment", post, texto.slice(0, 90));

        const mencoes = extrairMencoesDoTexto(texto);
        for (const pessoa of mencoes) {
          await criarNotificacaoPara(pessoa.uid, "mention_comment", post, "marcou você em um comentário");
        }

        input.value = "";
      } catch (error) {
        alert("Não foi possível comentar agora: " + error.message);
      }
    }

    async function compartilharPost(post) {
      const texto = post.texto || "Post do abelhaKut 🐝";

      try {
        if (navigator.share) {
          await navigator.share({
            title: "abelhaKut",
            text: texto
          });
        } else {
          await navigator.clipboard.writeText(texto);
          alert("Texto do post copiado!");
        }

        await criarNotificacaoPara(post.autorId, "share", post, "compartilhou sua publicação");
      } catch (error) {
        alert("Não foi possível compartilhar/copiar.");
      }
    }

    async function republicarPost(post) {
      if (!usuarioAtual || !dadosUsuario || !post) return;

      const confirmar = confirm("Republicar este post no seu perfil?");
      if (!confirmar) return;

      try {
        await addDoc(collection(db, "posts"), {
          autorId: usuarioAtual.uid,
          autorNome: dadosUsuario.nome || usuarioAtual.email,
          autorFoto: dadosUsuario.foto || placeholderFoto,
          texto: `Republicou de ${post.autorNome || "usuário"}:\n\n${post.texto || ""}`,
          imagem: post.imagem || "",
          curtidas: [],
          comentarios: [],
          repostDe: post.id,
          createdAt: serverTimestamp(),
          destinoPerfilId: usuarioAtual.uid
        });

        await criarNotificacaoPara(post.autorId, "share", post, "republicou sua publicação");
        alert("Post republicado no seu perfil!");
      } catch (error) {
        alert("Não foi possível republicar: " + error.message);
      }
    }

    async function excluirMeuPost(postId) {
      if (!usuarioAtual || !postId) return;

      const post = postsCache.find((p) => p.id === postId);
      if (!post || post.autorId !== usuarioAtual.uid) {
        alert("Você só pode excluir suas próprias publicações.");
        return;
      }

      const confirmar = confirm("Excluir esta publicação?");
      if (!confirmar) return;

      try {
        await deleteDoc(doc(db, "posts", postId));
      } catch (error) {
        alert("Não foi possível excluir: " + error.message);
      }
    }

    async function excluirMeuComentario(postId, comentario) {
      if (!usuarioAtual || !postId || !comentario) return;

      if (comentario.uid !== usuarioAtual.uid) {
        alert("Você só pode excluir seu próprio comentário.");
        return;
      }

      const confirmar = confirm("Excluir seu comentário?");
      if (!confirmar) return;

      try {
        await updateDoc(doc(db, "posts", postId), {
          comentarios: arrayRemove(comentario)
        });
      } catch (error) {
        alert("Não foi possível excluir o comentário: " + error.message);
      }
    }

    function criarCardPost(post) {
      const card = document.createElement("article");
      card.className = "post-card-real";
      card.id = "post-" + post.id;
      card.id = "post-" + post.id;

      const data = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
      const horario = data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      const curtidas = Array.isArray(post.curtidas) ? post.curtidas : [];
      const comentarios = Array.isArray(post.comentarios) ? post.comentarios : [];
      const jaCurti = usuarioAtual ? curtidas.includes(usuarioAtual.uid) : false;
      const meuPost = usuarioAtual && post.autorId === usuarioAtual.uid;

      card.innerHTML = `
        <div class="post-options-wrap">
          <button class="post-options-btn" title="Opções">⋯</button>
          <div class="post-options-menu hidden-menu">
            <button data-repost>Republicar</button>
            ${meuPost ? `<button class="delete-post-option" data-delete-post>Excluir publicação</button>` : ""}
          </div>
        </div>

        <div class="post-author clickable-author" onclick="abrirPerfilUsuario('${post.autorId}')">
          <img src="${post.autorFoto || placeholderFoto}" alt="Foto de ${post.autorNome || "usuário"}" />
          <div>
            <strong>${post.autorNome || "Usuário"}</strong>
            <small>${horario}</small>
          </div>
        </div>

        ${post.texto ? `<div class="post-text">${post.texto}</div>` : ""}
        ${post.imagem ? `<img class="post-image" src="${post.imagem}" alt="Imagem da postagem" />` : ""}

        <div class="post-actions-row">
          <button class="${jaCurti ? "liked-post-btn" : ""}" data-like-btn>
            ${jaCurti ? "❤️ Curtido" : "🤍 Curtir"} (${curtidas.length})
          </button>
          <button data-comment-toggle>💬 Comentários (${comentarios.length})</button>
          <button data-share-btn>📤 Compartilhar</button>
        </div>

        <div class="comments-box hidden" data-comments-box>
          <div class="comments-list" data-comments-list></div>
          <div class="comment-input-row">
            <input data-comment-input placeholder="Escreva um comentário..." maxlength="250" autocomplete="off" />
            <button data-comment-send>Enviar</button>
          </div>
        </div>
      `;

      const likeBtn = card.querySelector("[data-like-btn]");
      const commentToggle = card.querySelector("[data-comment-toggle]");
      const shareBtn = card.querySelector("[data-share-btn]");
      const commentsBox = card.querySelector("[data-comments-box]");
      const commentsList = card.querySelector("[data-comments-list]");
      const commentInput = card.querySelector("[data-comment-input]");
      const commentSend = card.querySelector("[data-comment-send]");
      const optionsBtn = card.querySelector(".post-options-btn");
      const optionsMenu = card.querySelector(".post-options-menu");
      const repostBtn = card.querySelector("[data-repost]");
      const deletePostBtn = card.querySelector("[data-delete-post]");

      renderizarComentariosLista(commentsList, comentarios, post.id);
      configurarMencoesTextarea(commentInput);

      likeBtn.onclick = () => alternarCurtidaPost(post.id, curtidas, post);
      commentToggle.onclick = () => commentsBox.classList.toggle("hidden");
      commentSend.onclick = () => enviarComentarioPost(post.id, commentInput, post);
      commentInput.onkeydown = (event) => {
        if (event.key === "Enter") enviarComentarioPost(post.id, commentInput, post);
      };
      shareBtn.onclick = () => compartilharPost(post);

      optionsBtn.onclick = (event) => {
        event.stopPropagation();
        document.querySelectorAll(".post-options-menu").forEach((menu) => {
          if (menu !== optionsMenu) menu.classList.add("hidden-menu");
        });
        optionsMenu.classList.toggle("hidden-menu");
      };

      repostBtn.onclick = () => republicarPost(post);
      if (deletePostBtn) deletePostBtn.onclick = () => excluirMeuPost(post.id);

      return card;
    }

    function renderizarPosts(posts) {
      if (!feedPosts) return;

      feedPosts.innerHTML = "";

      if (posts.length === 0) {
        feedPosts.innerHTML = `
          <div class="panel feed-empty">
            <div class="feed-icon">🐝</div>
            <h2>Nenhuma postagem ainda</h2>
            <p>Seja o primeiro a publicar algo no abelhaKut.</p>
          </div>
        `;
        return;
      }

      posts.forEach((post) => {
        const card = criarCardPost(post);
        feedPosts.appendChild(card);
      });
    }

    window.abrirMenuFotoPerfil = function () {
      if (!dadosUsuario) return;
      fotoPerfilModalImg.src = dadosUsuario.foto || placeholderFoto;
      fotoPerfilModal.classList.remove("hidden");
    };

    window.fecharMenuFotoPerfil = function () {
      fotoPerfilModal.classList.add("hidden");
    };

    window.verFotoCompleta = function () {
      const foto = dadosUsuario?.foto || placeholderFoto;
      const novaAba = window.open();
      if (novaAba) {
        novaAba.document.write(`<img src="${foto}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
        novaAba.document.title = "Foto de perfil";
      }
    };

    window.escolherNovaFoto = function () {
      fecharMenuFotoPerfil();
      fotoArquivo.click();
    };

    window.atualizarContadorBio = function () {
      if (!bioInput || !bioCount) return;
      bioCount.textContent = bioInput.value.length;
    };

    window.salvarBio = async function () {
      if (!usuarioAtual || !bioInput) return;

      const bio = bioInput.value.trim();

      if (bio.length > 160) {
        bioStatus.textContent = "A bio pode ter no máximo 160 caracteres.";
        return;
      }

      bioStatus.textContent = "Salvando bio...";

      try {
        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          bio
        });

        dadosUsuario.bio = bio;
        if (miniBioTexto) miniBioTexto.textContent = bio || "Clique para ver sua foto";
        if (profilePageBio) profilePageBio.textContent = bio || "Sem bio ainda.";
        if (profileAboutBio) profileAboutBio.textContent = bio || "Bio ainda não preenchida.";
        bioStatus.textContent = "Bio salva com sucesso!";
      } catch (error) {
        bioStatus.textContent = "Erro ao salvar bio: " + error.message;
      }
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
        if (fotoPerfilModalImg) fotoPerfilModalImg.src = fotoBase64;
        if (postMinhaFoto) postMinhaFoto.src = fotoBase64;
        if (profilePostMinhaFoto) profilePostMinhaFoto.src = fotoBase64;
        if (profileLargePhoto) profileLargePhoto.src = fotoBase64;
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
        const agora = Date.now();

        snap.forEach((docSnap) => {
          const pessoa = docSnap.data();
          if (!pessoa?.uid || pessoa.uid === usuarioAtual.uid) return;

          const statusAnterior = statusUsuarios[pessoa.uid];
          const statusAtual = !!pessoa.online;
          const ehAmigo = (dadosUsuario?.amigos || []).includes(pessoa.uid);

          // Evita notificação falsa de "saiu/entrou" quando a pessoa apenas atualiza a página.
          // Quando recebe offline, espera alguns segundos. Se voltar online rápido, cancela.
          if (!primeiraLeituraStatusOnline && ehAmigo && statusAnterior !== undefined && statusAnterior !== statusAtual) {
            if (statusAtual === false) {
              if (statusMudancasPendentes[pessoa.uid]) {
                clearTimeout(statusMudancasPendentes[pessoa.uid]);
              }

              statusMudancasPendentes[pessoa.uid] = setTimeout(() => {
                if (statusUsuarios[pessoa.uid] === false) {
                  mostrarNotificacaoStatus(pessoa, false);
                }
                delete statusMudancasPendentes[pessoa.uid];
              }, 7000);
            } else {
              if (statusMudancasPendentes[pessoa.uid]) {
                clearTimeout(statusMudancasPendentes[pessoa.uid]);
                delete statusMudancasPendentes[pessoa.uid];
              } else {
                mostrarNotificacaoStatus(pessoa, true);
              }
            }
          }

          statusUsuarios[pessoa.uid] = statusAtual;
        });

        primeiraLeituraStatusOnline = false;

        if (dadosUsuario) {
          carregarAmigos();
        }

        atualizarStatusChat();
        renderizarContatos();
      });
    }

    async function mostrarNotificacaoMensagem(chatId) {
      if (!usuarioAtual || !onlineToastContainer) return;

      const outroId = chatId.split("_").find((id) => id !== usuarioAtual.uid);
      if (!outroId) return;

      let pessoa = amigos.find((p) => p.uid === outroId);

      if (!pessoa) {
        const snapPessoa = await getDoc(doc(db, "users", outroId));
        if (snapPessoa.exists()) pessoa = snapPessoa.data();
      }

      if (!pessoa) return;

      let textoMensagem = "mandou uma nova mensagem";

      try {
        const mensagensRef = collection(db, "messages");
        const q = query(mensagensRef, where("chatId", "==", chatId));
        const snap = await getDocs(q);

        const lista = [];
        snap.forEach((docSnap) => {
          const msg = docSnap.data();
          if (msg.senderId === outroId) {
            lista.push(msg);
          }
        });

        lista.sort((a, b) => {
          const tempoA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tempoB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tempoB - tempoA;
        });

        if (lista[0]?.texto) {
          textoMensagem = lista[0].texto;
        }
      } catch (error) {
        console.warn("Não foi possível buscar a última mensagem:", error);
      }

      const toast = document.createElement("div");
      toast.className = "online-toast message-toast";

      toast.innerHTML = `
        <img src="${pessoa.foto || placeholderFoto}" alt="Foto de ${pessoa.nome || "usuário"}" />
        <div>
          <strong>${pessoa.nome || "Nova mensagem"}</strong>
          <small>💬 ${textoMensagem}</small>
        </div>
      `;

      toast.onclick = async () => {
        await abrirChatPorId(outroId);
        await marcarConversaComoLida(chatId);
        toast.remove();
      };

      onlineToastContainer.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 6500);
    }

    async function marcarConversaComoLida(chatId) {
      if (!usuarioAtual || !chatId) return;

      await updateDoc(doc(db, "users", usuarioAtual.uid), {
        unreadChats: arrayRemove(chatId)
      }).catch(() => {});

      dadosUsuario.unreadChats = (dadosUsuario.unreadChats || []).filter((id) => id !== chatId);
      ultimoUnreadChats = (ultimoUnreadChats || []).filter((id) => id !== chatId);

      renderizarNotificacoes();
      renderizarPainelConversas();
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
        ouvirPosts();
        ouvirNotificacoesPersistentes();
        document.body.classList.remove("auth-checking");
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
        if (unsubscribePosts) {
          unsubscribePosts();
          unsubscribePosts = null;
        }
        if (unsubscribeNotificacoes) {
          unsubscribeNotificacoes();
          unsubscribeNotificacoes = null;
        }
        usuarioAtual = null;
        dadosUsuario = null;
        document.body.classList.remove("auth-checking");
        limparCamposAuth();
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
          bio: "",
          capa: placeholderCapa,
          amigos: [],
          solicitacoesRecebidas: [],
          solicitacoesEnviadas: [],
          bloqueados: [],
          unreadChats: [],
          conversasOcultas: [],
          criadoEm: serverTimestamp()
        });
        dadosUsuario = {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.email.split("@")[0],
          email: usuarioAtual.email,
          foto: placeholderFoto,
          bio: "",
          capa: placeholderCapa,
          amigos: [],
          solicitacoesRecebidas: [],
          solicitacoesEnviadas: [],
          bloqueados: [],
          unreadChats: [],
          conversasOcultas: []
        };
      } else {
        dadosUsuario = snap.data();
      }
      meuNome.textContent = dadosUsuario.nome;
      if (meuNomePerfil) meuNomePerfil.textContent = dadosUsuario.nome;
      minhaFotoTopo.src = dadosUsuario.foto || placeholderFoto;
      minhaFotoPerfil.src = dadosUsuario.foto || placeholderFoto;
      if (fotoPerfilModalImg) fotoPerfilModalImg.src = dadosUsuario.foto || placeholderFoto;
      if (postMinhaFoto) postMinhaFoto.src = dadosUsuario.foto || placeholderFoto;
      if (profilePostMinhaFoto) profilePostMinhaFoto.src = dadosUsuario.foto || placeholderFoto;
      if (profileLargePhoto) profileLargePhoto.src = dadosUsuario.foto || placeholderFoto;
      if (profileCoverImg) profileCoverImg.src = dadosUsuario.capa || placeholderCapa;
      if (profilePageName) profilePageName.textContent = dadosUsuario.nome || "Meu perfil";
      if (profilePageBio) profilePageBio.textContent = dadosUsuario.bio || "Sem bio ainda.";
      if (profileAboutBio) profileAboutBio.textContent = dadosUsuario.bio || "Bio ainda não preenchida.";
      if (bioInput) bioInput.value = dadosUsuario.bio || "";
      if (miniBioTexto) miniBioTexto.textContent = dadosUsuario.bio || "Clique para ver sua foto";
      atualizarContadorBio();
      configurarMencoesTextarea(postTextoInput);
      configurarMencoesTextarea(profilePostTextoInput);
      await carregarUsuariosSociais();
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

        // Na primeira leitura não mostra mensagens antigas.
        // Depois disso, mensagem nova aparece em uma barra lateral.
        if (!primeiroSnapshotUsuario && novosChats.length > 0) {
          const chatParaNotificar = novosChats[novosChats.length - 1];
          await mostrarNotificacaoMensagem(chatParaNotificar);
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









    function gerarIdSimples() {
      return Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    }

    async function criarNotificacaoPara(uidDestino, tipo, post, textoExtra = "") {
      if (!uidDestino || !usuarioAtual || uidDestino === usuarioAtual.uid) return;

      try {
        await addDoc(collection(db, "notifications"), {
          uidDestino,
          uidOrigem: usuarioAtual.uid,
          nomeOrigem: dadosUsuario?.nome || usuarioAtual.email,
          fotoOrigem: dadosUsuario?.foto || placeholderFoto,
          tipo,
          postId: post?.id || "",
          postAutorId: post?.autorId || "",
          postTexto: (post?.texto || "").slice(0, 120),
          textoExtra,
          lida: false,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.warn("Erro ao criar notificação:", error);
      }
    }

    function ouvirNotificacoesPersistentes() {
      if (!usuarioAtual) return;
      if (unsubscribeNotificacoes) unsubscribeNotificacoes();

      const qNotif = query(
        collection(db, "notifications"),
        where("uidDestino", "==", usuarioAtual.uid)
      );

      unsubscribeNotificacoes = onSnapshot(qNotif, (snap) => {
        notificacoesCache = [];

        snap.forEach((docSnap) => {
          notificacoesCache.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });

        notificacoesCache.sort((a, b) => {
          const tempoA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tempoB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tempoB - tempoA;
        });

        renderizarNotificacoes();
      });
    }

    async function marcarNotificacaoLida(id) {
      if (!id) return;

      await updateDoc(doc(db, "notifications", id), {
        lida: true
      }).catch(() => {});
    }

    function textoNotificacaoSocial(n) {
      if (n.tipo === "like") return "curtiu sua publicação";
      if (n.tipo === "comment") return "comentou na sua publicação";
      if (n.tipo === "share") return "republicou sua publicação";
      if (n.tipo === "mention") return "marcou você em uma publicação";
      if (n.tipo === "mention_comment") return "marcou você em um comentário";
      return "interagiu com você";
    }

    async function abrirNotificacaoPost(notificacaoId, postId) {
      await marcarNotificacaoLida(notificacaoId);

      if (!postId) return;

      postFocoId = postId;
      voltarParaInicio();

      setTimeout(() => {
        const el = document.getElementById("post-" + postId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlight-post");
          setTimeout(() => el.classList.remove("highlight-post"), 2300);
        }
      }, 500);
    }


    async function renderizarNotificacoes() {
      if (!dadosUsuario) return;

      const recebidas = dadosUsuario.solicitacoesRecebidas || [];
      const unreadChats = dadosUsuario.unreadChats || [];
      const sociaisNaoLidas = notificacoesCache.filter((n) => !n.lida).length;
      const total = recebidas.length + unreadChats.length + sociaisNaoLidas;

      bellCount.textContent = total;
      bellCount.style.display = total > 0 ? "flex" : "none";

      if (chatTopCount) {
        chatTopCount.textContent = unreadChats.length;
        chatTopCount.style.display = unreadChats.length > 0 ? "flex" : "none";
      }

      renderizarPainelConversas();
      renderizarPainelAmigos();

      notificationsBox.innerHTML = "";

      if (total === 0 && notificacoesCache.length === 0) {
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

      if (notificacoesCache.length > 0) {
        const title = document.createElement("div");
        title.className = "notification-section-title";
        title.textContent = "Atividades";
        notificationsBox.appendChild(title);
      }

      notificacoesCache.slice(0, 40).forEach((n) => {
        const item = document.createElement("div");
        item.className = "notification-item clickable-notification social-notification-item";
        item.onclick = () => abrirNotificacaoPost(n.id, n.postId);

        const data = n.createdAt?.toDate ? n.createdAt.toDate() : null;
        const quando = data ? data.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }) : "";

        item.innerHTML = `
          <img src="${n.fotoOrigem || placeholderFoto}" />
          <div>
            <strong>${n.nomeOrigem || "Alguém"}</strong>
            ${!n.lida ? `<span class="notification-unread"></span>` : ""}
            <br />
            <small>${textoNotificacaoSocial(n)}</small>
            ${n.textoExtra ? `<div class="notification-meta">${n.textoExtra}</div>` : ""}
            ${n.postTexto ? `<div class="notification-meta">"${n.postTexto}"</div>` : ""}
            ${quando ? `<div class="notification-meta">${quando}</div>` : ""}
          </div>
        `;

        notificationsBox.appendChild(item);
      });
    }


    async function carregarUsuariosSociais() {
      if (!usuarioAtual || !dadosUsuario) return;

      try {
        const snap = await getDocs(collection(db, "users"));
        todosUsuarios = [];

        snap.forEach((docSnap) => {
          const pessoa = docSnap.data();
          if (pessoa?.uid) {
            todosUsuarios.push(pessoa);
          }
        });

        if (typeof renderizarSugestoesAmizade === "function") renderizarSugestoesAmizade();
        if (typeof renderizarAniversarios === "function") renderizarAniversarios();
        if (typeof renderizarContatos === "function") renderizarContatos();
      } catch (error) {
        console.warn("Erro ao carregar usuários sociais:", error);
      }
    }

    function renderizarSugestoesAmizade() {
      if (!suggestionsList || !dadosUsuario || !usuarioAtual) return;

      const meusAmigos = dadosUsuario.amigos || [];
      const enviados = dadosUsuario.solicitacoesEnviadas || [];
      const recebidas = dadosUsuario.solicitacoesRecebidas || [];
      const bloqueados = dadosUsuario.bloqueados || [];

      const sugestoes = (todosUsuarios || [])
        .filter((pessoa) => pessoa.uid !== usuarioAtual.uid)
        .filter((pessoa) => !meusAmigos.includes(pessoa.uid))
        .filter((pessoa) => !enviados.includes(pessoa.uid))
        .filter((pessoa) => !recebidas.includes(pessoa.uid))
        .filter((pessoa) => !bloqueados.includes(pessoa.uid))
        .filter((pessoa) => !(pessoa.bloqueados || []).includes(usuarioAtual.uid))
        .slice(0, 6);

      if (suggestionsCount) suggestionsCount.textContent = sugestoes.length;
      suggestionsList.innerHTML = "";

      if (sugestoes.length === 0) {
        suggestionsList.innerHTML = "<p class='muted-text'>Nenhuma sugestão agora.</p>";
        return;
      }

      sugestoes.forEach((pessoa) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerHTML = `
          <div class="suggestion-avatar-wrap">
            <img onclick="abrirPerfilUsuario('${pessoa.uid}')" src="${pessoa.foto || placeholderFoto}" alt="Foto de ${pessoa.nome || "usuário"}" />
            <button class="add-suggestion-btn" title="Adicionar">+</button>
          </div>
          <div class="clickable-author" onclick="abrirPerfilUsuario('${pessoa.uid}')">
            <strong>${pessoa.nome || "Usuário"}</strong>
            <small>membro abelhaKut</small>
          </div>
        `;

        const addBtn = item.querySelector(".add-suggestion-btn");
        if (addBtn) {
          addBtn.onclick = (event) => {
            event.stopPropagation();
            enviarSolicitacao(pessoa.uid);
          };
        }

        suggestionsList.appendChild(item);
      });
    }

    function renderizarContatos() {
      if (!contactsList) return;

      contactsList.innerHTML = "";
      if (contactsCount) contactsCount.textContent = amigos.length;

      if (!amigos || amigos.length === 0) {
        contactsList.innerHTML = "<p class='muted-text'>Adicione amigos para ver contatos aqui.</p>";
        return;
      }

      const ordenados = [...amigos].sort((a, b) => {
        const aOnline = obterStatusOnline(a.uid) ? 1 : 0;
        const bOnline = obterStatusOnline(b.uid) ? 1 : 0;
        return bOnline - aOnline || (a.nome || "").localeCompare(b.nome || "");
      });

      ordenados.forEach((amigo) => {
        const online = obterStatusOnline(amigo.uid);
        const item = document.createElement("div");
        item.className = "contact-item";
        item.onclick = () => abrirChatPorId(amigo.uid);
        item.innerHTML = `
          <img src="${amigo.foto || placeholderFoto}" alt="Foto de ${amigo.nome || "amigo"}" />
          <div>
            <strong>${amigo.nome || "Amigo"}</strong>
            <small><span class="status-dot ${online ? "online" : "offline"}"></span>${online ? "Online" : "Offline"}</small>
          </div>
        `;
        contactsList.appendChild(item);
      });
    }

    function renderizarAniversarios() {
      if (!birthdaysList) return;

      const hoje = new Date();
      const proximos = (todosUsuarios || [])
        .filter((pessoa) => pessoa.uid !== usuarioAtual?.uid)
        .filter((pessoa) => pessoa.nascimento)
        .map((pessoa) => {
          const [ano, mes, dia] = pessoa.nascimento.split("-").map(Number);
          let aniversario = new Date(hoje.getFullYear(), mes - 1, dia);

          if (aniversario < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) {
            aniversario = new Date(hoje.getFullYear() + 1, mes - 1, dia);
          }

          const diffDias = Math.ceil((aniversario - hoje) / (1000 * 60 * 60 * 24));
          return { pessoa, diffDias };
        })
        .filter((item) => item.diffDias >= 0 && item.diffDias <= 7)
        .sort((a, b) => a.diffDias - b.diffDias)
        .slice(0, 4);

      birthdaysList.innerHTML = "";

      if (proximos.length === 0) {
        birthdaysList.innerHTML = "<p class='muted-text'>Nenhum aniversário próximo.</p>";
        return;
      }

      proximos.forEach(({ pessoa, diffDias }) => {
        const item = document.createElement("div");
        item.className = "birthday-item";
        const texto = diffDias === 0 ? "faz aniversário hoje" : `faz aniversário em ${diffDias} dia(s)`;
        item.innerHTML = `
          <img onclick="abrirPerfilUsuario('${pessoa.uid}')" src="${pessoa.foto || placeholderFoto}" alt="Foto de ${pessoa.nome || "usuário"}" />
          <div class="clickable-author" onclick="abrirPerfilUsuario('${pessoa.uid}')">
            <strong>${pessoa.nome || "Usuário"}</strong>
            <small>${texto}</small>
          </div>
        `;
        birthdaysList.appendChild(item);
      });
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
      renderizarContatos();
      renderizarSugestoesAmizade();
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

    window.alternarPainelConversas = async function () {
      chatsDropdown.classList.toggle("hidden");
      friendsDropdown.classList.add("hidden");
      notificationsBox.classList.add("hidden");

      // Ao clicar no balão de conversas, as notificações de mensagem somem.
      const unreadChats = dadosUsuario?.unreadChats || [];
      if (unreadChats.length > 0 && usuarioAtual) {
        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          unreadChats: []
        }).catch(() => {});

        dadosUsuario.unreadChats = [];
        ultimoUnreadChats = [];
      }

      renderizarNotificacoes();
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

    async function apagarConversa(chatId, idAmigo) {
      if (!usuarioAtual || !chatId) return;

      const amigo = amigos.find((p) => p.uid === idAmigo);
      const nome = amigo?.nome || "essa pessoa";
      const confirmar = confirm(`Apagar TODAS as mensagens da conversa com ${nome}? Isso também apagará para a outra pessoa.`);
      if (!confirmar) return;

      try {
        const mensagensRef = collection(db, "messages");
        const q = query(mensagensRef, where("chatId", "==", chatId));
        const snap = await getDocs(q);

        const apagamentos = [];
        snap.forEach((docSnap) => {
          apagamentos.push(deleteDoc(doc(db, "messages", docSnap.id)));
        });

        await Promise.all(apagamentos);

        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          unreadChats: arrayRemove(chatId),
          conversasOcultas: arrayUnion(chatId)
        }).catch(() => {});

        if (idAmigo) {
          await updateDoc(doc(db, "users", idAmigo), {
            unreadChats: arrayRemove(chatId)
          }).catch(() => {});
        }

        if (chatIdAtual === chatId) {
          messages.innerHTML = "";
        }

        renderizarPainelConversas();
      } catch (error) {
        alert("Não foi possível apagar a conversa: " + error.message);
      }
    }

    function renderizarPainelConversas() {
      if (!chatsDropdown || !dadosUsuario) return;

      const unreadChats = dadosUsuario.unreadChats || [];
      const conversasOcultas = dadosUsuario.conversasOcultas || [];

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

      const amigosComConversa = amigos.filter((amigo) => {
        const chatId = gerarChatId(usuarioAtual.uid, amigo.uid);
        return !conversasOcultas.includes(chatId);
      });

      if (amigosComConversa.length === 0) {
        list.innerHTML = "<p class='status'>Nenhuma conversa. Quando alguém mandar mensagem, ela aparecerá aqui.</p>";
        return;
      }

      const ordenados = [...amigosComConversa].sort((a, b) => {
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
          <div class="chat-list-actions">
            <span class="chat-unread-pill">1</span>
            <button class="chat-options-btn" title="Opções">⋯</button>
            <div class="chat-options-menu hidden-menu">
              <button>Apagar conversa</button>
            </div>
          </div>
        `;

        const optionsBtn = item.querySelector(".chat-options-btn");
        const optionsMenu = item.querySelector(".chat-options-menu");
        const deleteBtn = optionsMenu.querySelector("button");

        optionsBtn.onclick = (event) => {
          event.stopPropagation();
          document.querySelectorAll(".chat-options-menu").forEach((menu) => {
            if (menu !== optionsMenu) menu.classList.add("hidden-menu");
          });
          optionsMenu.classList.toggle("hidden-menu");
        };

        deleteBtn.onclick = async (event) => {
          event.stopPropagation();
          await apagarConversa(chatId, amigo.uid);
        };

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

      if (texto.length < 2) {
        // Se estiver digitando no topo e apagar busca, volta para lista normal de amigos.
        if (!friendsDropdown.classList.contains("hidden")) {
          renderizarPainelAmigos();
        }
        return;
      }

      const destino = searchResults || friendsDropdown;

      if (!searchResults && destino) {
        destino.classList.remove("hidden");
        destino.innerHTML = `
          <div class="dropdown-title">
            <h3>🔎 Buscar pessoas</h3>
            <button class="dropdown-close-btn" onclick="fecharPainelAmigos()">Fechar</button>
          </div>
        `;
      }

      const usersRef = collection(db, "users");
      const snap = await getDocs(usersRef);
      const idsMostrados = new Set();

      snap.forEach((docSnap) => {
        const user = docSnap.data();
        if (!user?.uid || idsMostrados.has(user.uid)) return;

        const jaSouEu = user.uid === usuarioAtual.uid;
        const jaEhAmigo = (dadosUsuario.amigos || []).includes(user.uid);
        const jaEnviei = (dadosUsuario.solicitacoesEnviadas || []).includes(user.uid);
        const bloqueei = (dadosUsuario.bloqueados || []).includes(user.uid);
        const meBloqueou = (user.bloqueados || []).includes(usuarioAtual.uid);
        const bateNome = user.nome?.toLowerCase().includes(texto);
        const bateEmail = user.email?.toLowerCase().includes(texto);

        if (!jaSouEu && !jaEhAmigo && !jaEnviei && !bloqueei && !meBloqueou && (bateNome || bateEmail)) {
          idsMostrados.add(user.uid);

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

          if (destino) destino.appendChild(item);
        }
      });

      if (idsMostrados.size === 0 && destino) {
        const vazio = document.createElement("p");
        vazio.className = "status";
        vazio.textContent = "Nenhuma pessoa encontrada.";
        destino.appendChild(vazio);
      }
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
        await carregarUsuariosSociais();
        if (perfilAbertoDados) renderizarBotoesPerfil(perfilAbertoDados, perfilAbertoDados.uid === usuarioAtual.uid);
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

      await marcarConversaComoLida(chatIdAtual);

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
            ${minha ? `<button class="message-options-btn" title="Opções">⌃</button>` : ""}
            <div>${msg.texto}</div>
            <small>${tempo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small>
            ${minha ? `
              <div class="message-menu hidden-menu">
                <button>Apagar mensagem</button>
              </div>
            ` : ""}
          `;

          const botaoOpcoes = div.querySelector(".message-options-btn");
          const menu = div.querySelector(".message-menu");
          if (botaoOpcoes && menu) {
            botaoOpcoes.onclick = (event) => {
              event.stopPropagation();
              document.querySelectorAll(".message-menu").forEach((m) => {
                if (m !== menu) m.classList.add("hidden-menu");
              });
              menu.classList.toggle("hidden-menu");
            };
          }

          const botaoApagar = menu?.querySelector("button");
          if (botaoApagar) botaoApagar.onclick = () => apagarMensagem(msg.id, tempo);

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


    if (profileBioEditInput) {
      profileBioEditInput.addEventListener("input", () => {
        if (profileBioEditCount) profileBioEditCount.textContent = profileBioEditInput.value.length;
      });
    }

    if (fotoPerfilModal) {
      fotoPerfilModal.addEventListener("click", (event) => {
        if (event.target === fotoPerfilModal) {
          fecharMenuFotoPerfil();
        }
      });
    }

    document.addEventListener("click", () => {
      document.querySelectorAll(".message-menu, .chat-options-menu, .post-options-menu").forEach((menu) => {
        menu.classList.add("hidden-menu");
      });
    });

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

        // Se a conversa tinha sido apagada/ocultada no balão, ela volta quando alguém manda nova mensagem.
        await updateDoc(doc(db, "users", usuarioAtual.uid), {
          conversasOcultas: arrayRemove(chatIdAtual)
        }).catch(() => {});

        await updateDoc(doc(db, "users", amigoChat.uid), {
          unreadChats: arrayUnion(chatIdAtual),
          conversasOcultas: arrayRemove(chatIdAtual)
        }).catch(() => {});

        emojiPicker.classList.add("hidden");
        await pararDigitando();
      } catch (error) {
        messageInput.value = texto;
        alert("Não foi possível enviar a mensagem: " + error.message);
      }
    };

    async function apagarMensagem(messageId, tempo) {
      const confirmar = confirm("Apagar esta mensagem para todos?");
      if (!confirmar) return;

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
