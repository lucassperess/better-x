# Contribuir

Descreva a mudança em uma issue ou pull request, incluindo navegador, versão da extensão, idioma do X e passos para reproduzir. Remova dados pessoais das capturas. Não envie cookies, tokens ou exportações completas da sua sessão.

Execute `npm test`. Para mudanças de interface, carregue a extensão sem compactação e teste:

- Home, perfil e página individual de publicação.
- Galerias com 1, 2, 3 e 4 imagens, incluindo publicações citadas.
- Imagens continuam visíveis após recarregar e rolar a página.
- Abas de timeline clicáveis; seta direita e rolagem horizontal sem interceptar fotos.
- Busca e sugestões funcionando sem cobrir as timelines.
- Controles ligados e desligados, incluindo desativar/reativar o feed amplo.
- Janelas largas e estreitas; português e inglês quando possível.

Evite seletores genéricos que alterem todos os `tablist` ou wrappers da página: o X reutiliza esses elementos em galerias. Restrinja estilos e eventos ao recurso pretendido. Não adicione bibliotecas remotas ou coleta de dados.

As contribuições são distribuídas sob a [licença MIT](LICENSE) do projeto.
