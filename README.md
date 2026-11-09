# Nexas-bot
Bot Discord français tout-en-un : modération, protections automatiques, journalisation, économie, niveaux, tickets et système de bienvenue.
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2018-339933?logo=node.js&logoColor=white)
![Licence](https://img.shields.io/badge/licence-MIT-blue)
## Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Permissions et intents](#permissions-et-intents)
- [Commandes](#commandes)
- [Structure du projet](#structure-du-projet)
- [Données](#données)
## Fonctionnalités
- **Modération** : ban, kick, mute, timeout, warn, clear, lock et unlock de salon.
- **Protections automatiques** : anti-invitations, anti-raid (rafales de messages) et anti-spam de mentions.
- **Journalisation** : messages, salons, membres, vocal et modération, chacun avec son salon de logs.
- **Économie** : solde, récompense journalière, travail, boutique et inventaire.
- **Niveaux** : XP, carte de rang et classement.
- **Tickets** : création, fermeture, journal et consultation par catégorie.
- **Bienvenue et départ** : messages personnalisables avec variables, et rôle automatique.
- **Préfixe configurable** par serveur avec `!prefix`.
- **Sauvegarde automatique** dans un fichier `db.json`, écrite aussi à l'arrêt du bot.
## Installation
Prérequis : [Node.js](https://nodejs.org) 18 ou supérieur et un bot créé sur le [portail développeur Discord](https://discord.com/developers/applications).
```bash
git clone https://github.com/<ton-compte>/<ton-depot>.git
cd <ton-depot>
npm init -y
npm install discord.js@latest
node index.js
```
Le bot utilise les composants V2, donc `discord.js` doit être en version **14.19 ou supérieure**.
## Configuration
Renseigne le fichier `config.json` à la racine :
```json
{
  "token": "",
  "prefix": "!",
  "ownerId": "",
  "autoRole": ""
}
```
| Clé        | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `token`    | Token du bot.                                |
| `prefix`   | Préfixe par défaut.           |
| `ownerId`  | ID Discord.                            |
| `autoRole` | ID du rôle donné aux nouveaux membres.        |
Variable d'environnement optionnelle : `BOT_PUBLIC_DB` permet de choisir l'emplacement du fichier de base de données.
## Permissions et intents
- Server Members Intent
- Message Content Intent
Intents utilisés : `Guilds`, `GuildMembers`, `GuildBans`, `GuildMessages`, `MessageContent`, `GuildVoiceStates` et `GuildMessageReactions`.
Pour inviter le bot, donne-lui au minimum les permissions de gérer les messages, les salons et les rôles, d'expulser, de bannir et de modérer les membres.
## Commandes
Préfixe par défaut : `!`. Tape `!help` pour la liste complète générée par le bot.
### Général
| Commande                | Description                              |
| ----------------------- | ---------------------------------------- |
| `!prefix [nouveau]`     | Affiche ou change le préfixe du serveur  |
### Modération
| Commande                               | Description                   |
| -------------------------------------- | ----------------------------- |
| `!ban @membre [raison]`                | Bannit un membre              |
| `!unban <ID>`                          | Débannit un membre            |
| `!kick @membre [raison]`               | Expulse un membre             |
| `!mute @membre [durée] [raison]`       | Met un membre en sourdine     |
| `!unmute @membre`                      | Retire le mute                |
| `!timeout @membre <minutes> [raison]`  | Restreint temporairement      |
| `!warn @membre <raison>`               | Avertit un membre             |
| `!clear <nombre>`                      | Supprime des messages         |
| `!lock [#salon]`                       | Verrouille le salon           |
| `!unlock [#salon]`                     | Déverrouille le salon         |
### Protections automatiques
Actives sur chaque message, sans commande : **anti-invitations**, **anti-raid** et **anti-spam de mentions**.
### Tickets
| Commande                | Description                              |
| ----------------------- | ---------------------------------------- |
| `!ticket <raison>`      | Crée un nouveau ticket                   |
| `!close`                | Ferme le ticket actuel                   |
| `!ticketlog <ID>`       | Affiche le journal d'un ticket           |
| `!category <ID>`        | Affiche les tickets d'une catégorie      |
### Niveaux
| Commande         | Description                           |
| ---------------- | ------------------------------------- |
| `!xp`            | Affiche vos points d'expérience       |
| `!rank`          | Affiche votre carte de rang           |
| `!leaderboard`   | Classement des meilleurs membres      |
### Économie
| Commande       | Description                          |
| -------------- | ------------------------------------ |
| `!balance`     | Affiche votre solde                  |
| `!daily`       | Récompense journalière               |
| `!work`        | Travaille pour gagner de l'argent    |
| `!shop`        | Affiche la boutique                  |
| `!inventory`   | Affiche votre inventaire             |
### Bienvenue et départ
| Commande                                    | Description                                    |
| ------------------------------------------- | ---------------------------------------------- |
| `!setwelcome #salon [message]`              | Définit le salon et le message de bienvenue    |
| `!setleave #salon [message]`                | Définit le salon et le message d'adieu         |
| `!welcome`                                  | Souhaite la bienvenue à un membre              |
| `!leave`                                    | Message d'adieu pour un membre                 |
| `!autorole [@rôle]` / `!autorole @membre @rôle` | Définit le rôle automatique ou l'attribue  |
Variables disponibles dans les messages : `{user}`, `{server}` et `{count}`.
### Journalisation
| Commande                 | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `!messagelog [#salon]`   | Suppressions et modifications de messages           |
| `!memberlog [#salon]`    | Arrivées, départs et changements de rôles           |
| `!moderationlog [#salon]`| Bannissements, timeouts et sanctions                |
| `!channellog [#salon]`   | Création, modification et suppression de salons     |
| `!voicelog [#salon]`     | Connexions, déconnexions et déplacements vocaux     |
### Sécurité et utilitaires
| Commande        | Description                                   |
| --------------- | --------------------------------------------- |
| `!botinfo`      | Informations sur le bot                       |
| `!owner`        | Informations sur le propriétaire              |
| `!permission`   | Vos permissions ou celles d'un membre         |
| `!help`         | Liste des commandes                           |
| `!ping`         | Latence du bot                                |
| `!avatar`       | Photo de profil                               |
| `!userinfo`     | Informations sur un utilisateur               |
| `!serverinfo`   | Informations sur le serveur                   |
| `!invite`       | Lien d'invitation                             |
## Structure du projet
```
├── index.js
├── config.json
└── commands/
    ├── automoderation/
    ├── economy/
    ├── levelSystem/
    ├── logging/
    ├── moderation/
    ├── security/
    ├── tickets/
    ├── utility/
    └── welcomeSystem/
```
