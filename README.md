<p align="center"><img src="icons/icon-512.png" width="128" alt="Better X"></p>

# Better X

Extensão simples para Brave/Chromium que oculta elementos indesejados do X por meio de toggles independentes.

## Instalar no Brave

1. Abra `brave://extensions`.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione esta pasta `better-x`.
5. Abra ou atualize `https://x.com`.
6. Fixe a extensão na barra do Brave e use os toggles.

Os controles de ocultação começam ativados, exceto **History**. O feed amplo também começa ativado. As preferências são salvas pelo navegador. Desative **Busca no topo + feed amplo** para restaurar o layout original.

Ao atualizar os arquivos da extensão, volte a `brave://extensions`, clique no botão de recarregar do Better X e depois atualize as abas abertas do X.

## Privacidade

A única permissão adicional é `storage`. A extensão lê a estrutura visual de `x.com`/`twitter.com` e altera sua apresentação. Não envia publicações, credenciais ou dados de navegação para servidores. As preferências usam `chrome.storage.sync` e podem ser sincronizadas pelo navegador conforme suas configurações.

## Desenvolvimento

Não há dependências de execução nem build. Depois de editar os arquivos, recarregue a extensão e as abas do X.

Com Node.js 22+, execute `npm test` para validar o pacote e a regressão de timelines versus galerias. O GitHub Actions também executa essas verificações em pushes e pull requests.

No Windows, execute `.\generate-icons.ps1` para gerar ícones a partir de `icons/logo-original.png` e `.\scripts\package.ps1` para criar o ZIP de distribuição em `dist/`.

## Recursos

- Ocultar itens do menu: Follow, Chat, Grok, History, Creator Studio e Premium.
- Ocultar cartões laterais de Premium, notícias, tendências e sugestões de pessoas.
- Ocultar avisos legais, banner de verificação e botões flutuantes de Grok/Chat.
- Feed amplo, busca no topo e rolagem horizontal das timelines.
- Controles independentes, preferências persistentes, JavaScript/CSS puros e Manifest V3.

## Baixar pelo GitHub

Use **Code → Download ZIP**, extraia e carregue a pasta que contém `manifest.json`. Também é possível extrair o pacote de distribuição. Brave e Chrome aceitam a instalação sem compactação em `brave://extensions` e `chrome://extensions`, respectivamente.

## Estado e limitações

Versão **0.11.0**, em desenvolvimento. Os seletores de texto contemplam português e inglês. Mudanças e testes de interface do X podem exigir manutenção.

As verificações automatizadas cobrem arquivos, configurações e o isolamento entre timelines e galerias; não substituem testes na sua conta. A correção de isolamento foi baseada na inspeção do Brave, mas sua validação visual completa após recarga ainda estava pendente. O feed amplo precisa de teste em diferentes tamanhos de janela antes de uma versão estável.

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para o roteiro de teste e [CHANGELOG.md](CHANGELOG.md) para as mudanças.

## Licença e marcas

Distribuído sob a [licença MIT](LICENSE). Copyright © 2026 lucassperess.

Projeto independente, sem afiliação com X ou Brave. Os nomes e marcas pertencem aos respectivos titulares.
