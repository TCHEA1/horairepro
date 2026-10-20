# HorairePro

**Les emplois du temps de tout votre établissement, générés en une minute et sans conflit.**

HorairePro est une application mobile installable, pensée pour les collèges et lycées de Côte d'Ivoire. Elle aide les directeurs des études, censeurs et éducateurs à produire les emplois du temps de chaque classe et de chaque professeur.

## Ce que fait l'application

- **Fiche établissement** : logo, nom, sigle, type, statut, code, DREN, adresse, boîte postale, téléphones, e-mail, chef d'établissement, signataire, devise.
- **Créneaux horaires** modifiables (07H15-08H10…), récréation et pause, jours ou demi-journées sans cours.
- **Horaires officiels** de la circulaire n°0311/MENA/CAB/DPFC du 1er septembre 2025, de la 6ème à la Terminale A, C, D (TICE, Dessin/Éd. musicale, LV2 facultative), modifiables. Les 1h30 (PC et SVT de la 6ème à la 4ème) : 1 h chaque semaine + 1 h une semaine sur deux ; chaque matière garde ses propres heures.
- **Cohérence classes ↔ professeurs** : un changement d'affectation met à jour tous les emplois du temps ; les conflits sont signalés en rouge et réparés en un geste.
- **Salles variables** : un professeur peut être au labo à 9h et dans une autre salle à 11h ; la salle de chaque cours peut être changée à la main.
- **Classes** (effectif, salle, professeur principal) et **professeurs** (matières, statut, diplôme, matricule, heures dues, maximum, indisponibilités).
- **Affectation automatique** des classes aux professeurs.
- **Génération automatique** : aucun professeur dans deux classes à la fois, séances de 2 h, une matière une fois par jour, matières principales le matin.
- **Retouche à la main** : touchez un cours, les cases possibles s'allument en vert, touchez-en une pour déplacer ou échanger.
- **Changement en cours d'année** : un professeur change ses jours ou heures ? HorairePro déplace seulement ses cours vers des heures libres (classe, professeur et salle), avec historique et retour en arrière.
- **Salles** : salle de chaque classe, salles spéciales par matière (labo, salle informatique, terrain), jamais deux classes dans la même salle à la même heure. Vue par salle, et salle indiquée sur l'emploi du temps des professeurs.
- **Fiches imprimables** au format officiel (en-tête Ministère / République, tableau récapitulatif, heures supplémentaires) et **export PDF** de toutes les classes ou tous les professeurs.
- **Hors connexion** après la première ouverture. Données stockées sur l'appareil, avec sauvegarde / restauration en fichier.

## Version mobile et version ordinateur

L'application s'adapte toute seule : version mobile sur téléphone, version ordinateur (menu latéral, écrans larges) sur PC et tablette. Le choix peut être forcé dans **Réglages → Affichage**.

## Installer sur un téléphone

1. Ouvrir l'adresse de l'application dans Chrome.
2. Menu ⋮ → **Installer l'application** (ou « Ajouter à l'écran d'accueil »).
3. Sur iPhone : bouton Partager → **Sur l'écran d'accueil**.

## Licences (abonnement annuel)

- Chaque établissement a **30 jours d'essai gratuit**, toutes fonctions ouvertes.
- Ensuite, la génération et les PDF demandent un **code d'activation** (Réglages → Licence).
- Les codes sont créés dans l'espace vendeur `admin.html`, protégé par un code PIN. Ils sont **signés** : impossible d'en fabriquer un faux sans la clé privée du vendeur.
- Le nom de l'établissement est inscrit dans le code et imprimé sur tous ses emplois du temps.

La clé privée (`cle-admin-horairepro.json`) ne doit **jamais** être mise sur GitHub.

## Hébergement

Site statique hébergé sur **Render** : https://horairepro.onrender.com

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/TCHEA1/horairepro)

La configuration est dans `render.yaml` (aucune compilation). Chaque envoi sur la branche `main` met le site à jour automatiquement.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète |
| `manifest.webmanifest` | Nom, icônes et couleurs pour l'installation |
| `sw.js` | Fonctionnement hors connexion |
| `admin.html` | Espace vendeur : clients et licences |
| `vendor/` | Bibliothèques PDF (jsPDF, jsPDF-AutoTable) |
| `icons/` | Icônes de l'application |

---

© 2026 TCHEA Ange Mares. Tous droits réservés.
