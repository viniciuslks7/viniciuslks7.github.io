# Como Configurar GitHub Pages

## Passo a Passo Completo

### 1. Preparar o Repositório

#### Criar novo repositório no GitHub:
1. Acesse https://github.com
2. Clique em "New repository"
3. Nome sugerido: `portfolio` ou `seuusuario.github.io`
4. Marque como "Public"
5. Clique em "Create repository"

### 2. Fazer Upload dos Arquivos

#### Opção A - Via GitHub Web:
1. No seu repositório, clique em "uploading an existing file"
2. Arraste todos os arquivos da pasta do projeto
3. Escreva uma mensagem de commit: "Initial portfolio setup"
4. Clique em "Commit changes"

#### Opção B - Via Git (linha de comando):
```bash
# Navegue até a pasta do projeto
cd "C:\Users\LAB\Desktop\Github Pages"

# Inicialize o git
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial portfolio setup"

# Conecte ao repositório remoto (substitua SEUUSUARIO)
git remote add origin https://github.com/SEUUSUARIO/portfolio.git

# Faça o push
git branch -M main
git push -u origin main
```

### 3. Ativar GitHub Pages

1. No seu repositório, vá em **Settings**
2. No menu lateral, clique em **Pages**
3. Em "Source", selecione **Deploy from a branch**
4. Escolha a branch **main**
5. Deixe a pasta como **/ (root)**
6. Clique em **Save**

### 4. Acessar seu Site

Após alguns minutos, seu site estará disponível em:
- Se o repositório se chama `portfolio`: `https://SEUUSUARIO.github.io/portfolio`
- Se o repositório se chama `SEUUSUARIO.github.io`: `https://SEUUSUARIO.github.io`

### 5. Personalizar o Conteúdo

Antes de publicar, edite o arquivo `index.html` e substitua:

#### Informações Pessoais:
- **Nome**: Substitua "Seu Nome" pelo seu nome real
- **Email**: Substitua "seu@email.com" pelo seu email
- **Telefone**: Substitua "+55 11 99999-9999" pelo seu telefone
- **Localização**: Substitua "São Paulo, SP" pela sua cidade

#### Links de Redes Sociais:
```html
<!-- Substitua os # pelos seus links reais -->
<a href="https://github.com/SEUUSUARIO">GitHub</a>
<a href="https://linkedin.com/in/SEUUSUARIO">LinkedIn</a>
```

#### Seção Sobre:
- Reescreva a descrição pessoal
- Atualize idade, experiência, localização
- Modifique as estatísticas (anos de experiência, projetos)

#### Experiência Profissional:
- Substitua os exemplos pelas suas experiências reais
- Atualize datas, empresas e descrições
- Adicione ou remova itens conforme necessário

#### Projetos:
- Substitua pelos seus projetos reais
- Atualize nomes, descrições e tecnologias
- Adicione links para os repositórios/demos

### 6. Adicionar suas Imagens

Na pasta `assets/`, adicione:
- **profile.jpg**: Sua foto profissional (500x500px)
- **about-me.jpg**: Foto para seção sobre (600x400px)
- **resume.pdf**: Seu currículo em PDF
- **projects/**: Imagens dos seus projetos

### 7. Testar Localmente (Opcional)

Para testar antes de publicar:
1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito no `index.html`
3. Selecione "Open with Live Server"

### 8. Domínio Personalizado (Opcional)

Se você tem um domínio próprio:
1. No GitHub, vá em Settings > Pages
2. Em "Custom domain", digite seu domínio
3. Configure o DNS do seu domínio para apontar para GitHub
4. Marque "Enforce HTTPS"

### 9. Atualizações Futuras

Para atualizar o site:
1. Edite os arquivos localmente
2. Faça commit e push das mudanças
3. O GitHub Pages atualizará automaticamente

```bash
git add .
git commit -m "Atualização do portfolio"
git push
```

### 10. Dicas Importantes

#### Performance:
- Otimize imagens antes de fazer upload
- Use formatos WebP quando possível
- Mantenha arquivos CSS e JS organizados

#### SEO:
- Atualize as meta tags no `<head>`
- Use títulos descritivos
- Adicione alt text nas imagens

#### Acessibilidade:
- Teste com leitores de tela
- Verifique contraste de cores
- Use estrutura HTML semântica

### 11. Solução de Problemas

#### Site não aparece:
- Verifique se GitHub Pages está ativado
- Confirme se os arquivos estão na branch correta
- Aguarde até 10 minutos para propagação

#### Erros 404:
- Verifique se o arquivo `index.html` está na raiz
- Confirme a estrutura de pastas
- Verifique links quebrados

#### Imagens não carregam:
- Confirme se as imagens estão na pasta `assets/`
- Verifique os nomes dos arquivos (case-sensitive)
- Use caminhos relativos corretos

### 12. Próximos Passos

Após configurar o básico:
1. Configure Google Analytics
2. Adicione meta tags para redes sociais
3. Otimize para motores de busca
4. Considere adicionar um blog
5. Implemente formulário de contato funcional

---

**Precisa de ajuda?** 
- Consulte a [documentação oficial do GitHub Pages](https://docs.github.com/pages)
- Verifique se seguiu todos os passos corretamente
- Entre em contato se tiver dúvidas específicas