# Kalanso

**Les emplois du temps de tout votre établissement, générés en une minute et sans conflit.**

Kalanso (« l'école », la maison où l'on apprend, en dioula) est une application mobile installable, pensée pour les collèges et lycées de Côte d'Ivoire. Elle aide les directeurs des études, censeurs et éducateurs à produire les emplois du temps de chaque classe et de chaque professeur.

## Ce que fait l'application

- **Fiche établissement** : logo, nom, sigle, type, statut, code, DREN, adresse, boîte postale, téléphones, e-mail, chef d'établissement, signataire, devise.
- **Créneaux horaires** modifiables (07H15-08H10…), récréation et pause, jours ou demi-journées sans cours.
- **Matières et volumes horaires** par niveau, de la 6ème à la Terminale (A, C, D).
- **Classes** (effectif, salle, professeur principal) et **professeurs** (matières, statut, diplôme, matricule, heures dues, maximum, indisponibilités).
- **Affectation automatique** des classes aux professeurs.
- **Génération automatique** : aucun professeur dans deux classes à la fois, séances de 2 h, une matière une fois par jour, matières principales le matin.
- **Retouche à la main** : échanger ou déplacer un cours d'un simple toucher.
- **Fiches imprimables** au format officiel (en-tête Ministère / République, tableau récapitulatif, heures supplémentaires) et **export PDF** de toutes les classes ou tous les professeurs.
- **Hors connexion** après la première ouverture. Données stockées sur l'appareil, avec sauvegarde / restauration en fichier.

## Installer sur un téléphone

1. Ouvrir l'adresse de l'application dans Chrome.
2. Menu ⋮ → **Installer l'application** (ou « Ajouter à l'écran d'accueil »).
3. Sur iPhone : bouton Partager → **Sur l'écran d'accueil**.

## Hébergement

Site statique, hébergé gratuitement avec GitHub Pages (branche `main`, dossier racine). Aucun serveur n'est nécessaire.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète |
| `manifest.webmanifest` | Nom, icônes et couleurs pour l'installation |
| `sw.js` | Fonctionnement hors connexion |
| `vendor/` | Bibliothèques PDF (jsPDF, jsPDF-AutoTable) |
| `icons/` | Icônes de l'application |

---

© 2026 TCHEA Ange Mares. Tous droits réservés.
