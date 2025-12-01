# Customização do Portfolio

## ✏️ Como Personalizar Seu Portfolio

### 1. Informações Pessoais

Abra o arquivo `index.html` e localize as seguintes seções para atualizar:

#### Hero Section (Início):
```html
<!-- Linha ~72 -->
<h1 class="hero-title mb-3">
    Olá, eu sou <span class="text-primary">SEU NOME AQUI</span>
</h1>
<h2 class="hero-subtitle mb-4">Desenvolvedor Full Stack</h2>
<p class="hero-description mb-4">
    SUA DESCRIÇÃO PESSOAL AQUI
</p>
```

#### Informações de Contato:
```html
<!-- Linha ~140 -->
<li><strong>Nome:</strong> SEU NOME</li>
<li><strong>Idade:</strong> SUA IDADE</li>
<li><strong>Localização:</strong> SUA CIDADE</li>
<li><strong>Email:</strong> SEU EMAIL</li>
<li><strong>Telefone:</strong> SEU TELEFONE</li>
```

### 2. Redes Sociais

Atualize todos os links das redes sociais (substitua os `#`):

```html
<!-- Links do Hero -->
<a href="https://github.com/SEUUSUARIO" class="social-link">
<a href="https://linkedin.com/in/SEUUSUARIO" class="social-link">
<a href="https://twitter.com/SEUUSUARIO" class="social-link">
<a href="mailto:SEU@EMAIL.COM" class="social-link">
```

### 3. Experiência Profissional

Na seção Experience, substitua pelos seus dados reais:

```html
<!-- Linha ~280 -->
<div class="timeline-content">
    <h4>SEU CARGO</h4>
    <p class="company">SUA EMPRESA</p>
    <p>DESCRIÇÃO DA SUA EXPERIÊNCIA</p>
</div>
```

### 4. Projetos

Atualize a seção de projetos com seus trabalhos:

```html
<!-- Linha ~380 -->
<div class="portfolio-content">
    <h4>NOME DO SEU PROJETO</h4>
    <p>DESCRIÇÃO DO SEU PROJETO</p>
    <div class="portfolio-tags">
        <span class="tag">TECNOLOGIA 1</span>
        <span class="tag">TECNOLOGIA 2</span>
    </div>
</div>
```

### 5. Habilidades

Ajuste as porcentagens das suas habilidades:

```html
<!-- Linha ~200 -->
<div class="progress-bar" style="width: 90%" data-skill="90"></div>
```

### 6. Cores do Site

No arquivo `css/style.css`, modifique as variáveis no início:

```css
:root {
    /* Suas cores personalizadas */
    --primary-color: #667eea;      /* Cor principal */
    --secondary-color: #764ba2;     /* Cor secundária */
    --accent-color: #f093fb;       /* Cor de destaque */
}
```

### 7. Fontes

Para mudar as fontes, edite no HTML:

```html
<!-- Linha ~16 -->
<link href="https://fonts.googleapis.com/css2?family=SuaFonte:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

E no CSS:
```css
:root {
    --font-primary: 'SuaFonte', sans-serif;
}
```

### 8. Meta Tags e SEO

Atualize as meta tags para SEO:

```html
<!-- Linha ~6 -->
<meta name="description" content="SUA DESCRIÇÃO">
<meta name="keywords" content="SUAS PALAVRAS-CHAVE">
<meta name="author" content="SEU NOME">
<title>SEU NOME - Portfolio</title>
```

### 9. Favicon

Substitua o favicon padrão:
1. Crie seu ícone (32x32px)
2. Salve como `favicon.ico` na pasta `assets/`
3. O HTML já está configurado para usar

### 10. Imagens

Adicione suas imagens na pasta `assets/`:

- **profile.jpg**: Sua foto (500x500px, quadrada)
- **about-me.jpg**: Foto para seção sobre (600x400px)  
- **resume.pdf**: Seu currículo
- **projects/**: Imagens dos projetos (800x600px)

### 11. Animações

Para personalizar animações, edite no `js/main.js`:

```javascript
// Velocidade das animações
AOS.init({
    duration: 1000,    // Duração em ms
    easing: 'ease',    // Tipo de transição
    once: true         // Animar apenas uma vez
});
```

### 12. Formulário de Contato

O formulário atualmente é apenas visual. Para torná-lo funcional:

#### Opção A - Netlify Forms (Gratuito):
1. Hospede no Netlify em vez do GitHub Pages
2. Adicione `data-netlify="true"` no form

#### Opção B - EmailJS:
1. Cadastre-se em https://emailjs.com
2. Configure o serviço de email
3. Adicione o código no JavaScript

#### Opção C - Formspree:
1. Cadastre-se em https://formspree.io
2. Configure seu endpoint
3. Atualize a action do form

### 13. Analytics

Para adicionar Google Analytics:

```html
<!-- Adicione antes do </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'SEU_GA_TRACKING_ID');
</script>
```

### 14. Performance

Para melhorar a performance:

1. **Otimize imagens**: Use TinyPNG ou Squoosh
2. **Minifique CSS/JS**: Use ferramentas online
3. **Use WebP**: Para imagens quando possível
4. **CDN**: As bibliotecas já usam CDN

### 15. Teste e Validação

Antes de publicar:

1. **W3C Validator**: Valide o HTML
2. **Teste responsivo**: Chrome DevTools
3. **Acessibilidade**: Use extensões como axe
4. **Performance**: Google PageSpeed Insights

### 16. Customizações Avançadas

#### Adicionar nova seção:
```html
<section id="nova-secao" class="section-padding">
    <div class="container">
        <div class="row">
            <!-- Seu conteúdo -->
        </div>
    </div>
</section>
```

#### Novo item no menu:
```html
<li class="nav-item">
    <a class="nav-link" href="#nova-secao">Nova Seção</a>
</li>
```

### 17. Backup

Sempre faça backup antes de modificações grandes:

```bash
git add .
git commit -m "Backup antes das modificações"
git push
```

---

## 🎨 Ideias de Personalização

### Temas de Cores:
- **Azul Profissional**: #2c3e50, #3498db
- **Verde Moderno**: #27ae60, #2ecc71  
- **Roxo Criativo**: #8e44ad, #9b59b6
- **Laranja Energético**: #e67e22, #f39c12

### Estilos de Fonte:
- **Moderna**: Montserrat, Open Sans
- **Elegante**: Playfair Display, Lora
- **Tech**: Fira Code, Source Code Pro
- **Minimalista**: Helvetica, Arial

### Animações Extra:
- Partículas no background
- Efeito parallax nas seções
- Transições de página
- Loading personalizado

---

**Dica**: Faça as mudanças gradualmente e teste cada alteração para garantir que tudo funcione corretamente!