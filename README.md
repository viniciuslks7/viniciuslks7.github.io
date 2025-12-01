# Portfolio Profissional - GitHub Pages

Um portfólio moderno e responsivo desenvolvido para GitHub Pages, inspirado em designs contemporâneos com foco na experiência do usuário.

## 🚀 Características

### ✨ Design e UX
- **Design Moderno**: Interface clean e profissional
- **Totalmente Responsivo**: Otimizado para desktop, tablet e mobile
- **Animações Suaves**: Transições e efeitos visuais elegantes
- **Scroll Spy**: Navegação que atualiza baseada na posição do scroll
- **Dark Theme Support**: Suporte automático ao tema escuro do sistema

### 🛠️ Tecnologias
- **HTML5**: Estrutura semântica e acessível
- **CSS3/SCSS**: Estilos modernos com variáveis CSS
- **Bootstrap 5.3**: Framework responsivo
- **JavaScript ES6+**: Funcionalidades interativas
- **Google Fonts**: Tipografia profissional (Poppins, Inter)
- **Font Awesome & IcoFont**: Ícones vetoriais
- **AOS Library**: Animações on scroll

### 🎯 Funcionalidades
- **Preloader Animado**: Carregamento elegante da página
- **Navegação Fixa**: Menu que se adapta ao scroll
- **Hero Section**: Seção principal com efeitos paralaxe
- **Sobre Mim**: Informações pessoais e profissionais
- **Habilidades**: Barras de progresso e gráficos circulares animados
- **Experiência**: Timeline interativa
- **Portfólio**: Galeria filtrada de projetos
- **Formulário de Contato**: Validação completa e envio
- **Botão Back to Top**: Navegação rápida
- **Performance Otimizada**: Carregamento rápido e eficiente

## 🎨 Seções do Portfólio

### 1. **Hero/Home**
- Apresentação pessoal com efeito de digitação
- Botões de call-to-action
- Links para redes sociais
- Elementos flutuantes animados

### 2. **Sobre Mim**
- Descrição profissional
- Informações pessoais
- Estatísticas (anos de experiência, projetos)
- Download do currículo

### 3. **Habilidades**
- Habilidades técnicas com barras de progresso
- Habilidades profissionais com gráficos circulares
- Grid de tecnologias com ícones

### 4. **Experiência**
- Timeline de experiências profissionais
- Timeline de educação
- Certificações e cursos

### 5. **Projetos**
- Galeria filtrada por categoria
- Overlay com ações (visualizar/acessar)
- Tags de tecnologias utilizadas
- Lightbox para imagens

### 6. **Contato**
- Informações de contato
- Formulário funcional com validação
- Integração com redes sociais
- Mapa (opcional)

## 🛠️ Instalação e Uso

### 1. Clone o repositório
```bash
git clone https://github.com/seuusuario/portfolio.git
cd portfolio
```

### 2. Personalize o conteúdo
Edite os seguintes arquivos com suas informações:

#### `index.html`
- Substitua "Seu Nome" pelo seu nome real
- Atualize as informações de contato
- Modifique as seções de experiência e educação
- Adicione seus projetos na seção portfólio

#### `css/style.css`
- Personalize as cores no início do arquivo (variáveis CSS)
- Ajuste estilos conforme necessário

#### `assets/`
- Adicione sua foto de perfil como `profile.jpg`
- Adicione imagens dos projetos na pasta `projects/`
- Inclua seu currículo como `resume.pdf`

### 3. Configure GitHub Pages
1. Faça push do código para seu repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch principal como source
4. Sua página estará disponível em `https://seuusuario.github.io/portfolio`

## 📁 Estrutura de Arquivos

```
portfolio/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos customizados
├── js/
│   └── main.js            # JavaScript principal
├── assets/
│   ├── profile.jpg        # Foto de perfil
│   ├── about-me.jpg       # Foto sobre mim
│   ├── resume.pdf         # Currículo em PDF
│   ├── favicon.ico        # Ícone do site
│   └── projects/          # Imagens dos projetos
│       ├── project-1.jpg
│       ├── project-2.jpg
│       └── ...
└── README.md              # Este arquivo
```

## 🎨 Personalização

### Cores
As cores podem ser facilmente alteradas modificando as variáveis CSS no início do arquivo `style.css`:

```css
:root {
    --primary-color: #667eea;    /* Cor principal */
    --secondary-color: #764ba2;   /* Cor secundária */
    --accent-color: #f093fb;      /* Cor de destaque */
    /* ... */
}
```

### Fontes
Para alterar as fontes, modifique os links no HTML e as variáveis CSS:

```css
--font-primary: 'Poppins', sans-serif;
--font-secondary: 'Inter', sans-serif;
```

### Animações
As animações podem ser controladas via JavaScript ou desabilitadas modificando as durações no CSS.

## 📱 Responsividade

O portfólio é totalmente responsivo com breakpoints para:
- **Desktop**: > 1200px
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🔧 Funcionalidades JavaScript

### Principais recursos:
- **Scroll Spy**: Atualização automática da navegação
- **Animações**: Elementos aparecem conforme o scroll
- **Filtros**: Portfolio filtrado por categoria
- **Formulários**: Validação e envio
- **Performance**: Throttling e debouncing otimizados

## 🚀 Performance

### Otimizações implementadas:
- **CSS e JS minificados**: Carregamento mais rápido
- **Imagens otimizadas**: Formatos modernos e compressão
- **Lazy Loading**: Carregamento sob demanda
- **CDN**: Bibliotecas servidas via CDN
- **Preloader**: Experiência de carregamento suave

## 📊 SEO e Acessibilidade

- **Meta tags**: Otimização para motores de busca
- **Open Graph**: Compartilhamento em redes sociais
- **Structured Data**: Marcação semântica
- **Alt texts**: Descrições para imagens
- **ARIA labels**: Acessibilidade para leitores de tela
- **Contraste**: Cores acessíveis para todos os usuários

## 🌐 Compatibilidade

### Navegadores suportados:
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fazer fork do projeto
2. Criar uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abrir um Pull Request

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:
1. Verifique as [Issues](https://github.com/seuusuario/portfolio/issues) existentes
2. Crie uma nova issue se necessário
3. Entre em contato via email: seu@email.com

## 🎯 Próximas Funcionalidades

- [ ] Integração com APIs (GitHub, LinkedIn)
- [ ] Blog integrado
- [ ] Sistema de comentários
- [ ] Analytics e métricas
- [ ] PWA (Progressive Web App)
- [ ] Modo escuro manual
- [ ] Múltiplos idiomas

---

**Desenvolvido com ❤️ e muito café ☕**

Feito por [Seu Nome](https://github.com/seuusuario)