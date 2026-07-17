# Le site

3 fichiers : `index.html` (structure), `style.css` (apparence), `script.js` (comportement).
Ouvre `index.html` dans un navigateur pour tester (double-clic, ou l'extension "Live Server" sur VS Code).

## 1. Ajouter tes images

Crée un dossier `images/` à côté des 3 fichiers, et mets dedans :

- `pilules.jpg` → l'image de fond de la page d'accueil
- `film.jpg` → l'affiche/photo du film que tu proposes
- `nourriture.jpg` → une photo pour la page nourriture

Tant que ces fichiers n'existent pas, le site reste propre : fond uni pour l'accueil, et un petit encadré "Ajoute ton image ici" pour le film et la nourriture.

Si tu préfères d'autres noms de fichiers, change les chemins dans `index.html` (attributs `src`) et dans `style.css` (règle `.page-bg--accueil`, propriété `background-image`).

## 2. Modifier les textes

Tout est directement dans `index.html`, en clair, pas de configuration cachée :

- Question de la page d'accueil : la balise `<h1 class="question">`
- Titre du film : `<h2 class="film-title" id="film-title">`
- Texte de la page nourriture : `<p class="subtext">`
- etc.

Cherche les commentaires `IMAGE À CHANGER` dans `index.html` et `style.css` pour repérer les emplacements liés aux images.

## 3. Configurer l'envoi du mail (EmailJS)

Le bouton final envoie un mail via EmailJS, un service gratuit qui permet d'envoyer un mail depuis du JavaScript, sans serveur. Étapes :

1. Crée un compte gratuit sur [emailjs.com](https://www.emailjs.com).
2. Dans le tableau de bord, va dans **Email Services** → ajoute un service (ex : connecte ton compte Gmail). Note son **Service ID**.
3. Va dans **Email Templates** → crée un template. Utilise ces variables dans le corps du template (elles seront remplies automatiquement) :
   - `{{dates}}`
   - `{{film}}`
   - `{{activite}}`
   - `{{dodo}}`

   Renseigne aussi l'adresse mail de destination directement dans le champ "To email" du template (dans ton compte EmailJS, pas dans le code). Note le **Template ID**.
4. Va dans **Account → API Keys** et note ta **Public Key**.
5. Ouvre `script.js`, tout en haut, dans l'objet `CONFIG.emailjs` :

```js
emailjs: {
  publicKey: "TON_PUBLIC_KEY",
  serviceId: "TON_SERVICE_ID",
  templateId: "TON_TEMPLATE_ID",
},
```

Remplace les 3 valeurs par les tiennes. C'est tout, le bouton "Valider et envoyer" fonctionnera.

Le compte gratuit EmailJS permet 200 mails par mois, largement suffisant ici.

## 4. Changer le mois du calendrier

Dans `script.js`, objet `CONFIG.calendrier` :

```js
calendrier: {
  annee: 2026,
  mois: 6,     // 0 = janvier, 1 = février ... 6 = juillet
  titre: "Juillet 2026",
},
```

## Détails de comportement

- **Pilule bleue** → passe à l'étape suivante. **Pilule rouge** → petit effet de glitch, l'utilisateur reste sur la page.
- Le calendrier permet de sélectionner plusieurs dates ; le bouton "Valider" reste désactivé tant qu'aucune date n'est cochée.
- "Ce film t'intéresse ?" → passe directement à la suite. "Je préfère faire autre chose" → fait apparaître une zone de texte libre.
- La page récapitulative se remplit automatiquement avec tous les choix faits, juste avant l'envoi du mail.
