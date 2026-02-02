# ADR-001 : Application desktop avec Tauri

## Statut

**Accepté** - Janvier 2025

## Contexte

L'application zats-greenscore est initialement une application web statique générée avec Astro. Pour étendre la portée du projet et permettre une utilisation offline native, une version desktop a été envisagée.

### Options considérées

1. **Electron** - Framework populaire basé sur Chromium
2. **Tauri** - Framework léger basé sur WebView natif + Rust
3. **PWA** - Progressive Web App sans application native

## Décision

Nous avons choisi **Tauri 2.x** pour créer l'application desktop.

## Justification

### Cohérence avec la philosophie du projet

L'application évalue l'éco-conception des APIs. Utiliser un framework léger et efficient est cohérent avec nos valeurs :

| Critère | Electron | Tauri |
|---------|----------|-------|
| Taille du bundle | ~150 MB | ~3-10 MB |
| RAM utilisée | ~100-300 MB | ~30-50 MB |
| Empreinte carbone | Élevée | Faible |

### Avantages techniques

- **Légèreté** : Utilise le WebView natif de l'OS
- **Performance** : Backend en Rust
- **Sécurité** : Sandboxing et permissions granulaires
- **Multi-plateforme** : macOS, Windows, Linux

### Pattern "Integrated Repo"

Le code Tauri est intégré dans le même repository :

```
zats-greenscore/
├── src/           # Code Astro (partagé web/desktop)
├── src-tauri/     # Code spécifique Tauri
│   ├── src/       # Backend Rust
│   ├── icons/     # Icônes multi-plateformes
│   └── tauri.conf.json
└── package.json
```

**Avantages** :
- Une seule source de vérité pour l'UI
- Versioning unifié web/desktop
- CI/CD simplifié

## Conséquences

### Positives

- Application native légère (~5 MB)
- Fonctionnement offline complet
- Pas de dépendance à un navigateur externe
- Distribution via DMG/EXE/DEB

### Négatives

- Nécessite Rust toolchain pour le développement
- Courbe d'apprentissage pour les features natives
- Tests end-to-end plus complexes

### Neutres

- Le stockage reste en LocalStorage (via WebView)
- Pas de feature native spécifique pour l'instant

## Implémentation

### Scripts npm

```bash
npm run dev:desktop      # Dev avec hot reload
npm run build:desktop    # Build production
npm run tauri            # CLI Tauri direct
```

### Configuration

- `src-tauri/tauri.conf.json` : Configuration principale
- `src-tauri/capabilities/` : Permissions de l'app

## Références

- [Tauri Documentation](https://tauri.app/)
- [Tauri vs Electron](https://tauri.app/v1/references/benchmarks/)
- [PR #32 - feat: add a desktop Tauri app](https://github.com/zatsit-oss/zats-greenscore/pull/32)
