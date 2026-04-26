# Mon Budget — Application PWA

Application de gestion de budget personnel, installable sur Android (APK), iOS (Add to Home Screen) et navigateur.

Pré-remplie avec tes catégories (13 prélèvements automatiques, dépenses variables, recettes).
Stockage local dans le navigateur (LocalStorage) — fonctionne 100% hors ligne après le premier chargement.

---

## Contenu de l'archive

```
budget-pwa/
├── index.html              ← page d'entrée
├── app.js                  ← bundle React minifié (52 KB)
├── manifest.json           ← manifest PWA (nom, icônes, theme)
├── service-worker.js       ← cache offline
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   └── icon-maskable-512.png
└── README.md               ← ce fichier
```

Au premier chargement, le navigateur télécharge React, Recharts, lucide-react et Tailwind depuis des CDN publics (esm.sh, cdn.tailwindcss.com, fonts.gstatic.com). Le service worker met tout en cache. Les chargements suivants sont instantanés et fonctionnent sans réseau.

---

## Étape 1 — Héberger la PWA en HTTPS (5 min sur GitHub Pages)

Une PWA installable **doit** être servie en HTTPS. GitHub Pages le fait gratuitement.

1. Crée un nouveau dépôt GitHub, ex : `mon-budget`
2. Pousse le contenu du dossier `budget-pwa/` à la racine du dépôt
3. Sur GitHub : **Settings → Pages → Source : Deploy from branch → main / (root)** → Save
4. Attends 1-2 min, ton URL sera : `https://<ton-user>.github.io/mon-budget/`

Vérifie dans Chrome desktop que la page s'affiche correctement avant de passer à la suite.

> Alternative : Netlify, Vercel, Cloudflare Pages (drag & drop du dossier).

---

## Étape 2 — Générer le fichier APK avec PWABuilder

[PWABuilder](https://www.pwabuilder.com/) est l'outil officiel Microsoft (open source) pour empaqueter une PWA en application native.

1. Va sur **https://www.pwabuilder.com/**
2. Colle l'URL HTTPS de ton site → **Start**
3. Le service analyse ton manifest et ton service worker. Tu devrais voir un score de qualité (cible : 100/100, sinon il indique ce qui manque)
4. Clique **Package For Stores → Android**
5. Choisis **Other Android → Generate Package**
6. Les paramètres importants :
   - **Package ID** : `com.duhayon.monbudget` (un identifiant unique style reverse-DNS)
   - **App name** : Mon Budget
   - **Launch URL** : `/` (relatif au scope)
   - **Display mode** : Standalone
   - **Signing key** : laisse PWABuilder en générer une nouvelle (téléchargée dans le ZIP — **garde-la précieusement**, elle sert à signer toutes les futures mises à jour)
7. Clique **Download Package**

Tu obtiens un ZIP contenant :
- `app-release-signed.apk` ← **c'est ton APK final, à installer sur ton téléphone**
- `signing.keystore` + mot de passe → à conserver pour les mises à jour
- `assetlinks.json` → à publier optionnellement (voir étape 3)

L'APK généré est un **TWA** (Trusted Web Activity) : une vraie app Android qui ouvre ta PWA en plein écran sans la barre d'URL Chrome. Indistinguable d'une app native pour l'utilisateur.

---

## Étape 3 — Installer l'APK sur Android

1. Transfère `app-release-signed.apk` sur ton téléphone (USB, Drive, AirDrop équivalent)
2. Ouvre le fichier sur le téléphone
3. Android demande l'autorisation d'installer depuis cette source → Autoriser
4. Installation → l'icône "Mon Budget" apparaît dans ton tiroir d'apps
5. Première ouverture : si tu as connexion internet, l'app charge instantanément. Ensuite, tout fonctionne offline.

### (Optionnel) Supprimer la barre du haut "Run by Chrome"

Par défaut, un TWA non vérifié affiche une fine bandeau "Run by Chrome" pendant 1-2 sec au démarrage. Pour l'enlever :

1. Récupère le fichier `assetlinks.json` du ZIP PWABuilder
2. Place-le à la racine de ton site GitHub Pages : `https://<user>.github.io/mon-budget/.well-known/assetlinks.json`

Note : sur GitHub Pages, les dossiers commençant par `.` sont parfois ignorés. Crée un fichier `.nojekyll` à la racine pour forcer Jekyll à respecter ces dossiers.

---

## Alternative rapide — Sans APK, juste installer la PWA

Si tu veux juste utiliser l'app sur ton téléphone **sans passer par un APK**, c'est encore plus simple :

**Android (Chrome)** :
1. Ouvre l'URL HTTPS de ton site
2. Menu ⋮ → "Installer l'application" ou "Ajouter à l'écran d'accueil"
3. L'icône apparaît, l'app s'ouvre en plein écran comme une app native

**iOS (Safari)** :
1. Ouvre l'URL HTTPS
2. Bouton Partager → "Sur l'écran d'accueil"
3. L'icône apparaît

Cette méthode ne nécessite aucun APK, aucun PWABuilder, aucune signature. Ça fonctionne déjà tel quel.

---

## Sauvegarde des données

Les données sont stockées dans le `localStorage` du navigateur. Elles sont :
- Persistantes (gardées entre les sessions)
- Locales à l'appareil (pas de synchronisation entre téléphone et ordi)
- Effacées si tu désinstalles l'app ou vides le cache du navigateur

**Fais des exports JSON réguliers** depuis l'onglet Réglages (bouton "Exporter"). Sauvegarde-les sur Drive/iCloud. En cas de réinstallation ou pour synchroniser entre appareils, utilise "Importer".

---

## Personnalisation

Avant de générer l'APK final, tu peux :

- **Changer le nom** : `manifest.json` → `name` et `short_name`
- **Changer les couleurs** : `manifest.json` → `theme_color` et `background_color`, ainsi que `index.html` → `<meta name="theme-color">`
- **Remplacer les icônes** : remplace les 4 PNG dans `/icons/` (mêmes tailles, mêmes noms)
- **Modifier les catégories par défaut** : édite `app.js` (ou recompile depuis le source `app.jsx` avec esbuild)

---

## Mise à jour de l'app

Quand tu modifies le code :

1. Republie sur GitHub Pages (`git push`)
2. Incrémente le `CACHE_VERSION` dans `service-worker.js` (ex : `mon-budget-v1` → `mon-budget-v2`) pour forcer la mise à jour du cache
3. Pour distribuer une nouvelle version APK : refais une passe PWABuilder en utilisant la **même signing key** que la première fois (sinon Android refusera l'installation comme "mise à jour")

---

## Limites à connaître

- Pas de notifications push (nécessiterait un serveur)
- Pas de synchronisation cloud entre appareils (uniquement export/import manuel)
- Le 1er chargement nécessite internet (pour les CDN). Une fois en cache, fonctionne offline
- Sur iOS, les PWA installées ont des limites de stockage (~50 MB) et sont parfois purgées si l'app n'est pas utilisée pendant longtemps. Exporte régulièrement.

Pour Play Store : tu peux uploader l'APK PWABuilder, mais Google demande maintenant un AAB (Android App Bundle). PWABuilder propose aussi cette option dans la même interface.
